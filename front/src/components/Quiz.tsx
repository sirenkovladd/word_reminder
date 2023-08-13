import { For, Show, createSignal } from "solid-js";

type Quiz = {
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

function getStyle(correct: boolean, selected: boolean) {
  if (correct) {
    return "bg-green-500";
  }
  if (selected) {
    return "bg-red-500";
  }
  return "bg-violet-500";
}

function DrawQuiz(props: { quiz: Quiz, answer: (answerId: string) => void, correct?: string, status: 0 | 1 | 2, selected?: string }) {
  return <>
    <div class="max-6-xs text-3xl text-sky-700 font-thin my-16">{props.quiz.word}</div>
    <ul class="flex flex-wrap items-center">
      <For each={props.quiz.answers}>
        {(answer) => (
          <li class="basis-1/2">
            <Show when={props.status}>
              <div class={`${getStyle(props.correct === answer.translation, props.selected === answer.id)} mx-auto w-fit rounded-full m-1 px-5 py-2`}>{answer.translation}</div>
            </Show>
            <Show when={!props.status}>
              <button class="bg-violet-500 hover:bg-violet-600 w-fit rounded-full m-1 px-5 py-2" onClick={() => props.answer(answer.id)}>{answer.translation}</button>
            </Show>
          </li>
        )}
      </For>
    </ul>
  </>
}

let quizGlobal: Quiz | undefined;

export default function Quiz(props: { token: string }) {
  const [isLoading, setIsLoading] = createSignal(false);
  const [canNext, setCanNext] = createSignal(false);
  const [correct, setCorrect] = createSignal<string>();
  const [status, setStatus] = createSignal<0 | 1 | 2>(0);
  const [selected, setSelected] = createSignal<string | undefined>();

  const [quiz, setQuiz] = createSignal<Quiz | undefined>(quizGlobal);
  async function fetchQuiz() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/quiz", {
        method: "get",
        headers: {
          authorization: `${props.token}`,
        },
      });
      const quiz = await response.json();
      quizGlobal = quiz;
      setQuiz(quiz);
      setStatus(0);
      setCanNext(false);
      setCorrect(undefined);
      setSelected(undefined);
    } finally {
      setIsLoading(false);
    }
  }
  async function answer(answerId: string) {
    setIsLoading(true);
    setSelected(answerId);
    try {
      const response = await fetch("/api/quiz", {
        method: "post",
        headers: {
          authorization: `${props.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answer: answerId,
          salt: quiz()!.salt,
          id: quiz()!.id,
        }),
      });
      const result: { result: boolean, correct: string } = await response.json();
      setStatus(result.result ? 1 : 2);
      setCanNext(true);
      setCorrect(result.correct);
    } finally {
      setIsLoading(false);
    }
  }
  if (!quiz()) {
    fetchQuiz();
  }
  return (
    <div>
      <Show when={isLoading()}>
        <div class="fixed">Loading...</div>
      </Show>
      <Show when={quiz()}>
        <div class="max-6-xs text-6xl text-sky-700 font-thin uppercase md-16">Quiz</div>
        <DrawQuiz quiz={quiz()!} answer={answer} correct={correct()} status={status()} selected={selected()} />
      </Show>
      <Show when={status() === 1}>
        <div class="max-6-xs text-3xl text-sky-700 font-thin">Correct!</div>
      </Show>
      <Show when={status() === 2}>
        <div class="max-6-xs text-3xl text-sky-700 font-thin">Wrong!</div>
      </Show>
      <Show when={canNext()}>
        <button class='bg-green-500 hover:bg-green-600 active:bg-green-700 focus:outline-none focus:ring focus:ring-green-300 rounded-full m-1 px-5 py-2' onClick={fetchQuiz}>Next</button>
      </Show>
    </div>
  );
}
