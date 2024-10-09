import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { ConfigModule } from '@nestjs/config';
import { MailTrapConfig } from 'src/configs/mail.config';

@Module({
  imports: [ConfigModule.forFeature(MailTrapConfig)],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService]
})
export class MailModule {}
