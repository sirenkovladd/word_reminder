import { createCipheriv, createDecipheriv } from 'crypto';

const KEY = (process.env.KEY_ID || '').repeat(16).slice(0, 16);
if (!KEY) {
  throw new Error('Invalid key');
}

export enum Cls {
  User = '1',
  Word = '2',
  Quiz = '3',
  WordUser = '4',
}

function toText(id: number | string) {
  if (typeof id === 'string') {
    return id;
  }
  return Buffer.from(id.toString(16).padStart(2, '0'), 'hex').toString('utf8');
}

function fromText(text: string, isString?: boolean): number | string {
    if (isString) {
    return text;
  }
  return parseInt(Buffer.from(text, 'utf8').toString('hex'), 16);
}

function randomChar() {
  const hex = Math.floor(Math.random() * 256);
  const char = String.fromCharCode(hex);
  return char;
}

export function to(id: number | string, cls: Cls): string {
  var iv = cls.repeat(8).slice(0, 8);
  var text = randomChar() + cls + toText(id);
  var decipher = createCipheriv('DES-EDE-CBC', KEY , iv);
  var encrypted = decipher.update(text, 'utf8', "base64");
  encrypted += decipher.final('base64');
  return encrypted;
}

export function from(id: string, cls: Cls): number;
export function from<T extends boolean>(id: string, cls: Cls, isString: T): T extends true ? string : number;
export function from(id: string, cls: Cls, isString?: boolean): number | string {
  var iv = cls.repeat(8).slice(0, 8);
  var decipher = createDecipheriv('DES-EDE-CBC', KEY, iv);
  var decrypted = decipher.update(id, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  decrypted = decrypted.slice(1);
  if (decrypted.startsWith(cls)) {
    return fromText(decrypted.slice(cls.length), isString);
  }
  throw new Error('Invalid class');
}

// const c = '2023-07-06-5';
// for (let i = 0; i < 256; i++) {
//   const t = to(c, Cls.User);
//   console.log(t);
//   const f = from(t, Cls.User, true);
//   console.log(f);
//   if (f !== c) {
//     throw new Error('Invalid');
//   }
// }
// const t = to(c, Cls.Report);
// console.log(t);
// console.log(from(t, Cls.Report, true));