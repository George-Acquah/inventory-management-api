import { _Item } from '../interfaces/Items.interface';
import { Items } from '../schemas/items.schema';
import { convertDateToString } from '../utils/global.utils';

export function sanitizeItemFn(item: Items): _Item {
  if (!item) {
    return null;
  }

  delete item.__v; // Remove Mongoose version key if present
  item._id.toString();

  return {
    _id: item._id.toString(),
    itemName: item.itemName,
    itemImage: item?.itemImage ?? undefined,
    createdAt: convertDateToString(item.createdAt.toDateString()),
    updatedAt: convertDateToString(item.updatedAt.toDateString()),
    price: item.price,
    lastPrice: item.lastPrice,
    zone: item.zone,
    sexType: item.sexType,
    stock: item.stock,
    addedById: item.addedById,
    addedByName: item.addedByName
  };
}
