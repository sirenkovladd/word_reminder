import { Telegram } from './telegram';
import { type UpdateType } from './process';

export type ListUpdatesType = {
  ok: boolean;
  result: UpdateType[];
}

function isUpdateType(value: any): value is UpdateType {
  return typeof value === 'object' && value !== null && typeof value.update_id === 'number';
}

function isUpdatesType(value: any): value is ListUpdatesType {
  return typeof value === 'object' && value !== null && typeof value.ok === 'boolean' && Array.isArray(value.result) && value.result.every(isUpdateType);
}

export class Poll {
  private polling: NodeJS.Timeout | undefined;

  private lastUpdateId = 0;

  listeners: ((d: UpdateType) => void)[] = [];

  constructor(private telegram: Telegram, private pollInterval: number) {
  }

  onUpdate(cb: (d: UpdateType) => void) {
    this.listeners.push(cb);
  }

  removeListener(cb: (d: UpdateType) => void) {
    const i = this.listeners.indexOf(cb);
    if (i !== -1) {
      this.listeners.splice(i, 1);
    }
  }

  start() {
    if (this.polling) {
      return;
    }
    this.polling = setTimeout(() => this.poll(), this.pollInterval || 1000);
  }

  private async poll() {
    try {
      const data = await this.telegram.request('POST', 'getUpdates', {
        offset: this.lastUpdateId + 1,
        allowed_updates: []
      }, isUpdatesType);
      for (const update of data.result) {
        this.listeners.forEach(cb => cb(update));
        this.lastUpdateId = update.update_id;
      }
    } finally {
      this.polling = undefined;
      this.start();
    }
  }

  async stop() {
    if (this.polling) {
      clearTimeout(this.polling);
      this.polling = undefined;
    }
  }
}
