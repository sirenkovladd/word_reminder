import { createHmac } from 'crypto';
// import { Service } from "../service";

export type TelegramAuthType = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

export class Telegram {
  constructor(private setting: { token: string }) {

  }

  public verify(token: string): TelegramAuthType {
    const encoded = decodeURIComponent(token); 
    const data = encoded.split("&");

    const obj = Object.fromEntries(data.map(e => e.split("=")));
    
    data.sort();
    const dataToCheck = data.filter(e => !e.startsWith("hash="));
    
    const secret = createHmac('sha256', 'WebAppData').update(this.setting.token).digest();
    const _hash = createHmac('sha256', secret).update(dataToCheck.join("\n")).digest('hex');
    if (_hash === obj.hash) {
      try {
        const user = JSON.parse(obj.user);
        return user;
      } catch (e) {
        throw new Error('Invalid token');
      }
    }
    throw new Error('Invalid token');
  }
}
