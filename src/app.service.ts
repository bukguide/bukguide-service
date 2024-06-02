import { Injectable } from '@nestjs/common';
import { sendEmailService } from './email/emailService';

@Injectable()
export class AppService {
  getHello(): string {
    // sendEmailService('approve', { userName: "Thom - test mail" }, "thomhuynhhue@gmail.com", 'Your account has been authorized')

    return 'This is API for bukguid.com!';
  }
}
