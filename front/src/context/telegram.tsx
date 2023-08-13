import { createSignal, createContext, useContext, Accessor } from "solid-js";

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

type TelegramContext = {
  telegram: Accessor<any>,
  user: Accessor<User | undefined>,
  error: Accessor<string | undefined>,
}

const TelegramContext = createContext<TelegramContext>();

export function TelegramProvider(props) {
  const [telegram, setTelegram] = createSignal<any>(null);
  const [user, setUser] = createSignal<User>();
  const [error, setError] = createSignal<string>();
  readyPromise.then(() => {
    setTelegram(window.Telegram);
  });
  userPromise.then((user) => {
    setUser(user);
  }, (error) => {
    setError(error);
  });
  const context = {
    telegram,
    user,
    error,
  };

  return (
    <TelegramContext.Provider value={context}>
      {script}
      {props.children}
    </TelegramContext.Provider>
  );
}

export function useTelegram() { return useContext(TelegramContext); }