import { Service } from "../service";
// import { sql } from "../service";

export type WordsType = {
  id: number;
  word: string;
  translation: string;
  created_at: Date;
}

// const builder = sql.builder<WordsType>('words', [
//   'id',
//   'word',
//   'translation',
//   'created_at'
// ]);

export class Words {
  constructor(service: Service) {
  }
}
