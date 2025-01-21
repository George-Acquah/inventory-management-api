export interface _IBaseTransaction {
  soldByName: string;
  soldById: string;
  totalPrice: number;
}

export interface _ITransaction extends _IBaseTransaction {
  _id: string;
  itemNames: string[];
  totalQuantity: number;
  createdAt: string;
  updatedAt: string;
}

interface _IEntityData {
  count: number;
  type: string;
}

interface _ICountData {
  name: string;
  count: number;
}

interface _ITopSoldItems {
  name: string;
  itemsSold: number;
  itemsInStore: number;
}

export interface _IAnalyticsData {
  entityData: _IEntityData[];
  countData: _ICountData[];
  topSoldItems?: _ITopSoldItems[];
}
export type _TCreateTransaction = _IBaseTransaction;
