import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { AggregationService } from 'src/shared/services/aggregation.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Transactions,
  TransactionsSchema
} from 'src/shared/schemas/transactions.schema';
import { ItemsModule } from '../items/items.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Transactions.name,
        schema: TransactionsSchema
      }
    ]),
    ItemsModule
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, AggregationService]
})
export class TransactionsModule {}
