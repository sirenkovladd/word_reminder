import { createHash } from "crypto";
import { Service, sql, wrap } from "../service";
import { getRandom } from "../service/random";

export type QuizItem = {
  id: number;
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

export class Quiz {
  constructor(private service: Service) {
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

  private async usedWord(user: number, wordUserId: number) {
    const query = sql.sql`update user_words set count_quiz = count_quiz + 1, edited_at = now() where user_id = ${user} and id = ${wordUserId}`;
    await this.service.db.query(query);
  }

  private async increaseScore(user: number, wordUserId: number) {
    const query = sql.sql`update user_words set score = LEAST(score + ${this.service.setting.quiz.increase}, 4), edited_at = now() where user_id = ${user} and id = ${wordUserId}`;
    await this.service.db.query(query);
  }

  private async decreaseScore(user: number, wordUserIds: number[], score: number) {
    const query = sql.sql`update user_words set score = GREATEST(score - ${score}, -3), edited_at = now() where user_id = ${user} and id = any(${wordUserIds})`;
    await this.service.db.query(query);
  }

  async checkAnswer(user: string, salt: string, wordUserId: string, translationId: string): Promise<{ result: boolean, correct: string } | { error: string }> {
    const wordUser = wrap.from(wordUserId, wrap.Cls.Quiz);
    const translation = wrap.from(translationId, wrap.Cls.WordUser);
    const userId = wrap.from(user, wrap.Cls.User);
    if (wordUser !== translation) {
      await this.usedWord(userId, wordUser);
      await this.decreaseScore(userId, [wordUser], this.service.setting.quiz.decreaseMain);
      await this.decreaseScore(userId, [wordUser, translation], this.service.setting.quiz.decreaseChoice);
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
    await this.usedWord(userId, wordUser);
    await this.increaseScore(userId, wordUser);
    return { result: true, correct: result[0].translation };
  }

  async getGroups(user: string): Promise<{ group: string }[]> {
    const userId = wrap.from(user, wrap.Cls.User);
    const query = sql.sql`select distinct w.group from user_words uw left join words w on uw.word_id = w.id where uw.user_id = ${userId} and uw.enable order by w.group`;
    const result = await this.service.db.query<{ group: string }>(query);
    return result;
  }
}
