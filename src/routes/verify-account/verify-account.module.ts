import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AccountVerification,
  AccountVerificationSchema
} from 'src/shared/schemas/account-verification.schema';
import { AccountVerificationService } from './verify-account.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AccountVerification.name,
        schema: AccountVerificationSchema
      }
    ])
  ],
  controllers: [],
  providers: [AccountVerificationService],
  exports: [AccountVerificationService]
})
export class AccountVerificationModule {}
