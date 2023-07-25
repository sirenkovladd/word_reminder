export * as sql from './sql';
export * as wrap from './wrap';
import { Postgres } from './postgres';
import { Setting } from './setting';

export class Service {
  public db: Postgres;

  public setting: Setting;

  constructor() {
    this.db = Postgres.getInstance();
    this.setting = new Setting();
  }
}
