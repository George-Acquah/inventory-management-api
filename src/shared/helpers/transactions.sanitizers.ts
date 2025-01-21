import { _ITransaction } from '../interfaces/transactions.interface';
import { Transactions } from '../schemas/transactions.schema';
import { convertDateToString } from '../utils/global.utils';

export function sanitizeTransactionsFn(
  transaction: Transactions
): _ITransaction {
  if (!transaction) {
    return null;
  }

  delete transaction.__v; // Remove Mongoose version key if present
  transaction._id.toString();

  // Sanitize the items array
  const sanitizedItems = transaction.items.map((item) => item.itemName);

  return {
    _id: transaction._id.toString(),
    itemNames: sanitizedItems,
    totalQuantity: transaction.items.reduce(
      (acc, newItem) => acc + newItem.quantity,
      0
    ),
    createdAt: convertDateToString(transaction.createdAt.toDateString()),
    updatedAt: convertDateToString(transaction.updatedAt.toDateString()),
    totalPrice: transaction.totalPrice,
    soldById: transaction.soldById,
    soldByName: transaction.soldByName
  };
}

export function sanitizeAnalyticsFn(transaction: Transactions): any {
  if (!transaction) {
    return null;
  }

  delete transaction.__v; // Remove Mongoose version key if present
  transaction._id.toString();

  // Sanitize the items array
  const sanitizedItems = transaction.items.map((item) => item.itemName);

  return {
    _id: transaction._id.toString(),
    itemNames: sanitizedItems,
    totalQuantity: transaction.items.reduce(
      (acc, newItem) => acc + newItem.quantity,
      0
    ),
    createdAt: convertDateToString(transaction.createdAt.toDateString()),
    updatedAt: convertDateToString(transaction.updatedAt.toDateString()),
    totalPrice: transaction.totalPrice,
    soldById: transaction.soldById,
    soldByName: transaction.soldByName
  };
}
