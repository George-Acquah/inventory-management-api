import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './routes/auth/auth.module';
import { UsersModule } from './routes/users/users.module';
import { RootMongooseModule } from './modules/mongo.module';
import { StorageService } from './routes/storage/storage.service';
import { ItemsModule } from './routes/items/items.module';
import { TransactionsModule } from './routes/transactions/transactions.module';
import { StorageModule } from './routes/storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({}),
    RootMongooseModule,
    AuthModule,
    UsersModule,
    ItemsModule,
    TransactionsModule,
    StorageModule
  ],
  controllers: [AppController],
  providers: [AppService, StorageService]
})
export class AppModule {}
