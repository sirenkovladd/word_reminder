import { fetch } from 'undici';

export type UserType = {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export type MessageType = {
  message_id: number;
  from: UserType,
  chat: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    type: string;
  },
  date: number;
  text?: string;
  entities?: {
    offset: number;
    length: number;
    type: string;
    url?: string;
    user?: UserType;
  }[]
}

export type TelegramConfig = {
  token: string;
  timePolling?: number; // default 1000 ms
}

export type MessageEntityType = {
  type: 'mention' | 'hashtag' | 'cashtag' | 'bot_command' | 'url' | 'email' | 'phone_number' | 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code' | 'pre' | 'text_link' | 'text_mention';
  offset: number;
  length: number;
  url?: string;
  user?: UserType;
}

export type WebAppInfoType = {
  url: string;
}

export type LoginUrlType = {
  url: string;
  forward_text?: string;
  bot_username?: string;
  request_write_access?: boolean;
}

export type InlineKeyboardMarkupType = {
  inline_keyboard: {
    text: string;
    url?: string;
    callback_data?: string;
    switch_inline_query?: string;
    switch_inline_query_current_chat?: string;
    pay?: boolean;
    web_app?: WebAppInfoType;
    login_url?: LoginUrlType;
    callback_game?: never;
  }[][];
}

export type ReplyMarkupType = InlineKeyboardMarkupType;

export type SendMessageType = {
  parse_mode?: 'Markdown' | 'HTML';
  entities?: MessageEntityType[];
  disable_web_page_preview?: boolean;
  disable_notification?: boolean;
  reply_to_message_id?: number;
  protect_content?: boolean;
  allow_sending_without_reply?: boolean;
  reply_markup?: ReplyMarkupType;
}

export class Telegram {
  private url = `https://api.telegram.org/bot${this.config.token}/`;

  constructor(private config: TelegramConfig) {
  }

  async request<T>(methodHTTP: 'POST' | 'GET', methodTelegram: string, params: any): Promise<unknown>;
  async request<T>(methodHTTP: 'POST' | 'GET', methodTelegram: string, params: any, checker: (v: unknown) => v is T): Promise<T>;
  async request<T>(methodHTTP: 'POST' | 'GET', methodTelegram: string, params: any, checker?: (v: unknown) => v is T): Promise<T | unknown> {
    const response = await fetch(`${this.url}${methodTelegram}`, {
      method: methodHTTP,
      body: JSON.stringify(params),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Telegram API error');
    }
    if (!checker) {
      return await response.json();
    }
    const data = await response.json();
    if (!checker(data)) {
      throw new Error('Telegram API error');
    }
    return data;
  }

  async sendMessage(chatId: number, message: string, params?: SendMessageType) {
    return await this.request('POST', 'sendMessage', {
      ...params,
      chat_id: chatId,
      text: message,
    });
  }
}
