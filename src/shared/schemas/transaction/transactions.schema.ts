import { SchemaFactory } from '@nestjs/mongoose/dist/factories/schema.factory';
import { Transactions } from './transaction';

export const TransactionsSchema = SchemaFactory.createForClass(Transactions);
