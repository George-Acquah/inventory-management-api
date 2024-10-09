import { Controller, Post } from '@nestjs/common';
import { MailService } from './mail.service';
import { ApiResponse } from 'src/shared/res/api.response';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}
  @Post()
  async testMail() {
    console.log('EMAIL ON THE WAY');
    try {
      return new ApiResponse(200, 'Your mail was delivered.', {});
    } catch (error) {
      console.log(error);
    }
  }
}
