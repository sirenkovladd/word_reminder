import { Service, wrap, sql } from "../service";
import { Merge } from "../type/Merge";

export type UserType = {
  id: number;
  name: string;
  email: string | null;
  password: string | null;
  telegram_id: number | null;
  created_at: Date;
  photo: string | null;
  username: string | null;
}

export type WrappedUserType = Omit<Merge<{id: string}, UserType>, 'password'>;

type TokenType = {
  user: WrappedUserType;
  exp: number;
}

const builder = sql.builder<UserType>('users', [
  'id',
  'name',
  'email',
  'password',
  'telegram_id',
  'created_at'
]);

const EXPIRE = Number.parseInt(process.env.TOKEN_EXPIRE || '3600');

export class User {
  constructor(private service: Service) {
  }

  wrap(u: UserType): WrappedUserType {
    console.log(u);
    return {
      name: u.name,
      email: u.email,
      telegram_id: u.telegram_id,
      created_at: u.created_at,
      id: wrap.to(u.id, wrap.Cls.User),
      photo: u.photo,
      username: u.username,
    };
  }

  public async create(name: string, email: string, password: string): Promise<void> {
    await builder.insert().fields(['name', 'email', 'password']).item([name, email, password]).query(this.service);
  }

  public async get(id: string): Promise<WrappedUserType | undefined> {
    return (await builder.selectAll().eq('id', wrap.from(id, wrap.Cls.User)).limit(1).query(this.service, this.wrap))[0];
  }

  private unwrap(u: string): TokenType {
    try {
      const unwrap = wrap.from(u, wrap.Cls.User, true);
      return JSON.parse(unwrap);
    } catch (e) {
      throw new Error('Invalid token');
    }
  }

  public async getByTelegramId(telegram_id: number): Promise<WrappedUserType | undefined> {
    return (await builder.selectAll().eq('telegram_id', telegram_id).limit(1).query(this.service, this.wrap))[0];
  }

  public async setTelegramId(id: string, telegram_id: number): Promise<void> {
    await builder.update().set('telegram_id', telegram_id).eq('id', wrap.from(id, wrap.Cls.User)).query(this.service);
  }

  public checkAuthToken(token: string): WrappedUserType {
    const parseToken = this.unwrap(token);
    if (parseToken.exp * 1000 < Date.now()) {
      throw new Error('Token expired');
    }
    return parseToken.user;
  }

  public getAuthToken(user: WrappedUserType): string {
    const token: TokenType = {
      user: user,
      exp: Date.now() / 1000 + EXPIRE 
    };
    return wrap.to(JSON.stringify(token), wrap.Cls.User);
  }
}
