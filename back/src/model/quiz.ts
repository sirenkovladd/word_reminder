import { createHash } from "crypto";
import { Service, sql, wrap } from "../service";
import { getRandom } from "../service/random";
import { QueueGroup } from "./queue";

export type QuizItem = {
  id: number;
  word: string;
  translation: string;
  photo: string;
  score: number;
  edited_at: Date;
}

export type QuizItemWrap = {
  id: string;
  word: string;
  translation: string;
  photo: string;
  score: number;
  edited_at: Date;
}

export type QuizType = {
  id: string;
  salt: string;
  word: string;
  photo?: string;
  answers: {
    id: string;
    translation: string;
    photo?: string;
  }[];
}

function getScore(score: QuizItem, min: number, max: number, lastTime: number, newTime: number) {
  const diffScore = (max - min) * 1.5;
  const diffTime = (newTime - lastTime) * 2;

  return Math.pow((diffScore - score.score + min) * 10 / diffScore, 3) * Math.pow((diffTime - score.edited_at.getTime() / 1000 + lastTime) * 3 / diffTime, 1);
}

function getIndexFromScore(scores: number[], sum: number, randomize: () => number) {
  const random = randomize() * sum;
  let index = 0;
  let acc = 0;
  while (acc <= random) {
    acc += scores[index];
    index++;
  }
  return index - 1;
}

type QuizChange = {
  user: number;
  wordUserIds: number[];
  score: number;
};

type QuizUsedWord = {
  user: number;
  wordUserId: number;
}

export class Quiz {
  private queueChangeScore;

  private queueUsedWord;

  constructor(private service: Service) {
    this.queueChangeScore = new QueueGroup(async (d: QuizChange) => {
      const query = sql.sql`update user_words set score = GREATEST(LEAST(score + ${d.score}, 4), -3), edited_at = now() where user_id = ${d.user} and id = any(${d.wordUserIds})`;
      await this.service.db.query(query);
    }, 20);
    this.queueUsedWord = new QueueGroup(async (d: QuizUsedWord) => {
      const query = sql.sql`update user_words set count_quiz = count_quiz + 1, edited_at = now() where user_id = ${d.user} and id = ${d.wordUserId}`;
      await this.service.db.query(query);
    });
  }

  private getHashWordScore(score: number, edited_at: Date) {
    const text = `${score.toString()};${edited_at.getTime()}`;
    return createHash('sha256').update(text).digest('base64');
  }

  private getWord(words: QuizItem[], count: number, randomize: () => number) {
    const min = Math.min(...words.map((score) => score.score));
    const max = Math.max(...words.map((score) => score.score));

    const lastTime = Math.min(...words.map((score) => score.edited_at.getTime() / 1000));
    const newTime = Math.max(...words.map((score) => score.edited_at.getTime() / 1000));

    const mapped = words.map((score) => getScore(score, min, max, lastTime, newTime));
    const sum = mapped.reduce((acc, cur) => acc + cur, 0);

    console.log(JSON.stringify({ mapped, sum }))

    const first = getIndexFromScore(mapped, sum, randomize);
    const answers = [first];
    while (answers.length < count && answers.length < words.length) {
      const next = getIndexFromScore(mapped, sum, randomize);
      if (answers.indexOf(next) === -1) {
        answers.push(next);
      }
    }
    return {
      first,
      answers: answers.sort(() => randomize() - 0.5).map(i => words[i])
    }
  }

  async getQuiz(user: string, count?: number): Promise<QuizType> {
    const _count = Math.min(Math.max(count || 20, 2), 10);
    const userId = wrap.from(user, wrap.Cls.User);

    await this.queueChangeScore.wait(user);
    const query = sql.sql`select uw.score, uw.id, uw.edited_at, w.word, w.translation, w.photo
      from user_words uw left join words w on uw.word_id = w.id
      where uw.user_id = ${userId}
      and uw.quiz and uw.enable
      order by uw.edited_at asc, uw.id
      limit ${_count + 10}
    `;

    const result = await this.service.db.query<QuizItem>(query);

    if (result.length < 2) {
      throw new Error('Not enough words');
    }

    const rawSalt = result.map(e => `${e.id}-${e.score}-${e.edited_at.getTime()}`).join(';');
    const randomize = getRandom(rawSalt);

    const { first, answers } = this.getWord(result, _count, randomize);

    return {
      id: wrap.to(result[first].id, wrap.Cls.Quiz),
      salt: this.getHashWordScore(result[first].score, result[first].edited_at),
      word: result[first].word,
      photo: result[first].photo,
      answers: answers.map(answer => ({
        id: wrap.to(answer.id, wrap.Cls.WordUser),
        translation: answer.translation,
        photo: answer.photo,
      }))
    }
  }

  async getWords(user: string): Promise<QuizItemWrap[]> {
    const userId = wrap.from(user, wrap.Cls.User);

    await this.queueChangeScore.wait(user);
    const query = sql.sql`select uw.score, uw.id, uw.edited_at, w.word, w.translation, w.photo
      from user_words uw left join words w on uw.word_id = w.id
      where uw.user_id = ${userId}
      and uw.quiz and uw.enable
      order by uw.edited_at asc, uw.id
    `;

    const result = await this.service.db.query<QuizItem>(query);
    return result.map(e => ({
      id: wrap.to(e.id, wrap.Cls.WordUser),
      score: e.score,
      edited_at: e.edited_at,
      word: e.word,
      translation: e.translation,
      photo: e.photo,
    }));
  }

  async checkAnswer(user: string, salt: string, wordUserId: string, translationId: string): Promise<{ result: boolean, correct: string } | { error: string }> {
    const wordUser = wrap.from(wordUserId, wrap.Cls.Quiz);
    const translation = wrap.from(translationId, wrap.Cls.WordUser);
    const userId = wrap.from(user, wrap.Cls.User);

    return this.queueUsedWord.get(user, (queueUsedWord) => {
      return this.queueChangeScore.get(user, async (queueChangeScore) => {
        if (wordUser !== translation) {
          queueUsedWord.add({ user: userId, wordUserId: wordUser });
          queueChangeScore.add({ user: userId, wordUserIds: [wordUser], score: -this.service.setting.quiz.increase });
          queueChangeScore.add({ user: userId, wordUserIds: [translation], score: -this.service.setting.quiz.decreaseChoice });
          const word = await this.service.db.query<{ translation: string }>(sql.sql`select w.translation from user_words uw left join words w on uw.word_id = w.id where uw.id = ${wordUser} limit 1`);
          return { result: false, correct: word[0].translation };
        }
        const query = sql.sql`select uw.score, uw.id, uw.edited_at, w.translation
          from user_words uw left join words w on uw.word_id = w.id where uw.user_id = ${userId} and uw.id = ${wordUser} limit 1
        `;
        const result = await this.service.db.query<QuizItem>(query);
        if (result.length === 0) {
          return { error: 'Invalid quiz id' };
        }
        const hash = this.getHashWordScore(result[0].score, result[0].edited_at);
        if (hash !== salt) {
          return { error: 'Invalid salt' };
        }
        queueUsedWord.add({ user: userId, wordUserId: wordUser });
        queueChangeScore.add({ user: userId, wordUserIds: [wordUser], score: this.service.setting.quiz.increase });
        return { result: true, correct: result[0].translation };
      });
    })
  }

  async getGroups(user: string): Promise<{ group: string }[]> {
    const userId = wrap.from(user, wrap.Cls.User);
    const query = sql.sql`select distinct w.group from user_words uw left join words w on uw.word_id = w.id where uw.user_id = ${userId} and uw.enable order by w.group`;
    const result = await this.service.db.query<{ group: string }>(query);
    return result;
  }
}
