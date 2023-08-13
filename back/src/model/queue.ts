import { nextTick } from "process";

type Process<D, R> = {
  data: D;
  resolve: (result: R) => void;
  reject: (error: unknown) => void;
};

interface Queueble<D, R> {
  add(data: D): { result: Promise<R> };
}

export class Queue<D, R> implements Queueble<D, R> {
  private list: Process<D, R>[] = [];

  private running: Process<D, R>[] = [];

  private waiter: Promise<void> = Promise.resolve();

  private waiterResponse: (() => void) | undefined;

  constructor(private callback: (data: D) => Promise<R>, private max: number = 1) {
  }

  public add(data: D) {
    return {
      result: new Promise<R>((resolve, reject) => {
        this.list.push({
          data,
          resolve,
          reject,
        });
        nextTick(() => this.process());
      })
    }
  }

  private async process() {
    if (this.max > 0 && this.running.length >= this.max) {
      return;
    }

    const process = this.list.shift();
    if (!process) {
      return this.tryEnd();
    }

    this.running.push(process);

    if (!this.waiterResponse) {
      this.waiter = new Promise<void>(resolve => {
        this.waiterResponse = resolve;
      });
    }

    try {
      const r = await this.callback(process.data);
      process.resolve(r);
    } catch (e) {
      console.error(e);
      process.reject(e);
    } finally {
      this.running = this.running.filter(p => p !== process);
      nextTick(() => this.process());
    }
  }

  private tryEnd() {
    if (this.running.length === 0 && this.list.length === 0) {
      this.waiterResponse?.();
      this.waiterResponse = undefined;
    }
  }

  wait() {
    return this.waiter;
  }
}

type ListProcess<D, R> = {
  queue: Queue<D, R>;
  mustClose: number;
};

export class QueueGroup<D, R> {
  private list: Record<string, ListProcess<D, R>> = {};

  constructor(private callback: (data: D) => Promise<R>, private max: number = 1) {
  }

  get<RR>(key: string, cb: (queue: Queue<D, R>) => Promise<RR>): Promise<RR> {
    let queue = this.list[key];
    if (!queue) {
      queue = {
        queue: new Queue(this.callback, this.max),
        mustClose: 0,
      };
      this.list[key] = queue;
    }
    queue.mustClose += 1;
    return Promise.resolve(cb(queue.queue)).finally(() => {
      queue.mustClose -= 1;
      queue.queue.wait().finally(() => {
        if (queue && queue.mustClose === 0) {
          delete this.list[key];
        }
      });
    });
  }

  async wait(key: string): Promise<void> {
    const queue = this.list[key];
    if (!queue) {
      return;
    }
    await queue.queue.wait()
    if (queue.mustClose !== 0) {
      await this.wait(key);
    }
  }
}