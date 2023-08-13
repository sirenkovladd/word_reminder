import { createEffect, createSignal, Show } from "solid-js";
import { useNavigate } from "solid-start";
import Quiz from "~/components/Quiz";
import { useTelegram } from "~/context/telegram";

export default function Home() {
  const navigator = useNavigate();
  const telegramCtx = useTelegram();
  if (!telegramCtx) {
    navigator("/");
    return;
  }
  const { telegram, user } = telegramCtx;
  
  createEffect(() => {
    if (telegram()) {
      if (!telegram().WebApp.initDataUnsafe.query_id) {
        navigator("/");
      }
    }
  });

  return (
    <main class="text-center mx-auto text-gray-700 p-4">
      <Show when={user()} fallback={'Loading'}>
        <Quiz token={user()!.token} />
      </Show>
    </main>
  );
}
