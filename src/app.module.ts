import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './routes/auth/auth.module';
import { UsersModule } from './routes/users/users.module';
import { RootMongooseModule } from './modules/mongo.module';
import { MailModule } from './routes/mail/mail.module';
import { AccountVerificationModule } from './routes/verify-account/verify-account.module';
import { StorageService } from './routes/storage/storage.service';

@Module({
  imports: [
    ConfigModule.forRoot({}),
    RootMongooseModule,
    AuthModule,
    UsersModule,
    MailModule,
    AccountVerificationModule
  ],
  controllers: [AppController],
  providers: [AppService, StorageService]
})
export class AppModule {}
