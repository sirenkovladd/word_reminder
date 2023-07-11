import { Process } from './process';
import { Telegram, TelegramConfig } from './telegram';
import { Poll } from './poll';

export class TelegramClient {
  private process: Process;

  telegram: Telegram;

  private poll: Poll;

  constructor(config: TelegramConfig) {
    this.telegram = new Telegram(config);
    this.process = new Process(this.telegram);
    this.poll = new Poll(this.telegram, config.timePolling || 1000);
  }

  async start() {
    this.poll.onUpdate(update => this.process.parseUpdate(update));
    this.poll.start();
  }

  async stop() {
    this.poll.stop();
  }
}