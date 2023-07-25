import { createEffect, createSignal, Show } from "solid-js";
import { useNavigate } from "solid-start";
import Quiz from "~/components/Quiz";

const script = document.createElement("script");
script.src = "https://telegram.org/js/telegram-web-app.js";

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        initData: string;
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

type User = { 
  token: string;
  is_admin: boolean,
  user: {
    id: string,
    name: string,
    username?: string,
    photo?: string,
    email?: string,
    created_at?: string,
    telegram_id?: number
  },
  is_new_user: boolean,
}

const userPromise: Promise<User> = readyPromise.then(async () => {
  const user = await fetch("/api/web_app_data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token: window.Telegram.WebApp.initData
    }),
  });
  return user.json();
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
  const [user, setUser] = createSignal<User>();
  const [error, setError] = createSignal<string>();
  const navigator = useNavigate();
  readyPromise.then(() => {
    setTelegram(window.Telegram);
  });
  userPromise.then((user) => {
    setUser(user);
  }, (error) => {
    setError(error);
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
      {/* {telegram() && JSON.stringify(telegram().WebApp.initData)}
      {user() && JSON.stringify(user())}
      {error() && JSON.stringify(error())} */}
      {/* {telegram() && JSON.stringify(telegram().WebApp.initDataUnsafe)} */}
      <Show when={user()} fallback={'Loading'}>
        <Quiz token={user()!.token} />
      </Show>
    </main>
  );
}
