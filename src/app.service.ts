import { Injectable } from '@nestjs/common';
import { discordSendMessage } from 'src/discord/discordService';

@Injectable()
export class AppService {
  async getHello() {
    // sendEmailService('approve', { userName: "Thom - test mail" }, "thomhuynhhue@gmail.com", 'Your account has been authorized')
    return 'This is API for bukguid.com!';
  }
}
