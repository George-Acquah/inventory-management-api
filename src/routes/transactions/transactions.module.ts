import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { AggregationService } from 'src/shared/services/aggregation.service';

import { ItemsModule } from '../items/items.module';
import { Module } from '@nestjs/common/decorators/modules/module.decorator';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import {
  Transactions,
  TransactionsSchema
} from 'src/shared/schemas/transaction';

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
