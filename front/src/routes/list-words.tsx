import { For, Show, createEffect, createSignal } from "solid-js";
import { useNavigate } from "solid-start";
import { useTelegram } from "~/context/telegram";

export type QuizItem = {
  id: number;
  word: string;
  translation: string;
  photo: string;
  score: number;
  edited_at: Date;
};

let quizItemsGlobal: QuizItem[];

export default function ListWordsButton(props: {}) {
  const navigator = useNavigate();
  const telegramCtx = useTelegram();
  if (!telegramCtx) {
    navigator("/");
    return;
  }
  const { telegram, user } = telegramCtx;

  const [isLoading, setIsLoading] = createSignal(false);
  createEffect(() => {
    if (telegram()) {
      if (!telegram().WebApp.initDataUnsafe.query_id) {
        navigator("/");
        return;
      }
      if (!quizItems()) {
        fetchQuiz();
      }
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  });

  const word = createSignal("123");
  const translate = createSignal("qwe");
  const group = createSignal("asd");
  const [quizItems, setQuizItems] = createSignal<QuizItem[] | undefined>(quizItemsGlobal);

  async function fetchQuiz() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/quiz/words", {
        method: "get",
        headers: {
          authorization: `${user()?.token}`,
        },
      });
      const quizItems = await response.json();
      quizItemsGlobal = quizItems.words;
      setQuizItems(quizItems.words);
    } finally {
      setIsLoading(false);
    }
  }

  return <>
    <input type="text" value={word[0]()} />
    <input type="text" value={translate[0]()} />
    <input type="text" value={group[0]()} />

    <Show when={isLoading()}>
      <div class="fixed">Loading...</div>
    </Show>
    <Show when={!isLoading()}>
      <table>
        <tbody>
          <tr>
            <th>word</th>
            <th>translation</th>
            <th>group</th>
            <th>score</th>
          </tr>
          <For each={quizItems()}>
            {(v) => <>
              <tr>
                <td>{v.word}</td>
                <td>{v.translation}</td>
                <td>{'main'}</td>
                <td>{v.score}</td>
              </tr>
            </>}
          </For>
        </tbody>
      </table>
    </Show>
  </>
}
