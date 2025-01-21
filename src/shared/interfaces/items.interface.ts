import { Document } from 'mongoose';
import { ITEM_SEX_TYPE, ITEM_ZONE } from '../enums/general.enum';

export interface _IBaseItem {
  itemName: string;
  itemImage?: string[];
  price: number;
  lastPrice: number;
  zone: ITEM_ZONE;
  sexType: ITEM_SEX_TYPE;
  stock: number;
  addedByName: string;
  addedById: string;
}

export interface _IDbItem extends Document, _IBaseItem {
  createdAt: Date;
  updatedAt: Date;
}

export interface _Item extends _IBaseItem {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export type _TCreateItem = _IBaseItem;
