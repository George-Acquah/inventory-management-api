import { registerAs } from '@nestjs/config';
import { mailtrapConfigKey } from 'src/shared/constants/mail.constants';
import { _IMailConfig } from 'src/shared/interfaces/mail.interface';

const MailConfig: _IMailConfig = {
  token: process.env.MAIL_TOKEN,
  sender_email: process.env.SENDER_EMAIL,
  sender_name: process.env.SENDER_NAME,
  recipient_email: process.env.RECIPIENT_EMAIL,
  test_id: parseInt(process.env.TEST_ID),
  account_id: parseInt(process.env.ACCOUNT_ID)
};

export const MailTrapConfig = registerAs(mailtrapConfigKey, () => MailConfig);
