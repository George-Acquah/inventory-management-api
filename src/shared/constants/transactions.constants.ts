import { _IAggregationFields } from '../interfaces/aggregation.interface';
import { Transactions } from '../schemas/transaction/transaction';

export const projectTransactionsFields: (keyof Transactions)[] = [
  'soldByName',
  'items',
  'soldById',
  'totalPrice',
  'createdAt',
  'updatedAt'
];

export const FETCH_TRANSACTIONS_AGGREGATION: _IAggregationFields<Transactions> =
  {
    lookups: [],
    unwind_fields: [],
    project_fields: projectTransactionsFields,
    count_fields: []
  };

export const filterTransactionsFields: (keyof Transactions)[] = [
  'items',
  'soldByName'
];
