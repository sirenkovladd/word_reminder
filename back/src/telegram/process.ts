import { MessageType, Telegram } from "./telegram";

type InlineQueryType = {
  id: string;
}

type CallbackQueryType = {
  id: string;
}

export type UpdateType = {
  update_id: number;
  message?: MessageType;
  edited_message?: MessageType;
  inline_query?: InlineQueryType;
  callback_query?: CallbackQueryType;
}

const host = process.env.HOSTSERVER || 'http://localhost:3000/';
console.log({ host });

export class Process {
  constructor(private telegram: Telegram) {
  }

  async parseUpdate(update: UpdateType) {
    try {
      if (update.message) {
        await this.processMessage(update.message);
      } else if (update.edited_message) {
        await this.processMessage(update.edited_message);
      } else if (update.inline_query) {
        await this.processInlineQuery(update.inline_query);
      } else if (update.callback_query) {
        await this.processCallbackQuery(update.callback_query);
      } else {
        console.log({ update });
      }
    } catch (e) {
      console.error(e);
    }
  }

  private async processMessage(message: MessageType) {
    if (message.text) {
      if (message.text === '/start') {
        await this.processStart(message);
      }
    }
    console.log({ message, e: message.entities });
  }

  private async processStart(message: MessageType) {
    await this.telegram.sendMessage(message.chat.id, 'Hello!', {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Learn words',
              web_app: {
                url: host
              }
            }
          ]
        ]
      }
    });
  }

  private async processInlineQuery(inlineQuery: InlineQueryType) {
    console.log({ inlineQuery });
  }

  private async processCallbackQuery(callbackQuery: CallbackQueryType) {
    console.log({ callbackQuery });
  }
}
