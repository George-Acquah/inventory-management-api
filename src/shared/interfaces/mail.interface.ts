interface _IMailConfig {
  token: string;
  sender_email: string;
  sender_name: string;
  recipient_email: string;
  test_id: number;
  account_id: number;
}

interface _IMailSender {
  email: string;
  name: string;
}

interface _IMailRecipient {
  email: string;
  name?: string;
}

export { _IMailConfig, _IMailSender, _IMailRecipient };
