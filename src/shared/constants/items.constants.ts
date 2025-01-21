import { _IAggregationFields } from '../interfaces/aggregation.interface';
import { Items } from '../schemas/items.schema';

export const projectItemsFields: (keyof Items)[] = [
  'itemName',
  'itemImage',
  'price',
  'lastPrice',
  'addedByName',
  'stock',
  'zone',
  'sexType',
  'addedById',
  'createdAt',
  'updatedAt'
];

export const FETCH_ITEMS_AGGREGATION: _IAggregationFields<Items> = {
  lookups: [],
  unwind_fields: [],
  project_fields: projectItemsFields,
  count_fields: []
};

export const filterItemsFields: (keyof Items)[] = ['itemName', 'addedByName'];
