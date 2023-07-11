import Counter from "~/components/Counter";
import { createEffect, createSignal } from "solid-js";
import { useNavigate } from "solid-start";


const script = document.createElement("script");
script.src = "https://telegram.org/js/telegram-web-app.js";

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        initDataUnsafe: {
          query_id: string;
          user: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            photo_url?: string;
          };
          auth_date: string;
          hash: string;
        } | {};
      }
    };
  }
}

let ready: () => void;
const readyPromise = new Promise<void>((resolve) => {
  ready = resolve;
});

function scriptLoaded() {
  let interval: NodeJS.Timer;
  interval = setInterval(() => {
    if (window.Telegram.WebApp.initDataUnsafe) {
      clearInterval(interval);
      ready();
    }
  }, 20);
}
script.onload = () => scriptLoaded();

export default function Home() {
  const [telegram, setTelegram] = createSignal<any>(null);
  const navigator = useNavigate();
  readyPromise.then(() => {
    setTelegram(window.Telegram);
  });
  createEffect(() => {
    if (telegram()) {
      if (!telegram().WebApp.initDataUnsafe.query_id) {
        navigator("/");
      }
    }
  });

  // auth

  // display profile

  // poll quiz
  // render quiz
  // send result

  return (
    <main class="text-center mx-auto text-gray-700 p-4">
      {script}
      {telegram() && JSON.stringify(telegram().WebApp.initDataUnsafe)}
      <h1 class="max-6-xs text-6xl text-sky-700 font-thin uppercase my-16">
        Telegram
      </h1>
      <Counter />
    </main>
  );
}
