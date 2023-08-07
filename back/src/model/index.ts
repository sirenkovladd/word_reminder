import { Service } from "../service";
import { Quiz } from "./quiz";
import { Telegram } from "./telegram";
import { User } from "./user";
import { Words } from "./words";
import { Dictionary } from "./dictionary";

export class Model {
  public user: User;

  public telegram: Telegram;

  public words: Words;

  public quiz: Quiz;

  public dictionary: Dictionary;

  constructor(service: Service, setting: {telegram: {token: string}}) {
    this.user = new User(service);
    this.telegram = new Telegram(setting.telegram);
    this.words = new Words(service);
    this.quiz = new Quiz(service);
    this.dictionary = new Dictionary();
  }
}
