import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Document } from 'mongoose';
import { ITEM_SEX_TYPE, ITEM_ZONE } from '../enums/general.enum';

export type ItemsDocument = HydratedDocument<Items>;

@Schema({
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  timestamps: true // Automatically add createdAt and updatedAt fields
})
export class Items extends Document {
  @Prop({ required: true, unique: true, type: String })
  itemName: string;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ required: true, type: Number })
  lastPrice: number;

  @Prop({ required: true, type: Number })
  stock: number;

  @Prop({ required: true, type: String })
  addedByName: string;

  @Prop({ required: true, type: String })
  addedById: string;

  @Prop({ required: false, type: Array<string> })
  itemImage?: string[];

  @Prop({ required: true, enum: ITEM_ZONE })
  zone: ITEM_ZONE;

  @Prop({ required: true, enum: ITEM_SEX_TYPE, default: ITEM_SEX_TYPE.UNISEX })
  sexType: ITEM_SEX_TYPE;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const ItemsSchema = SchemaFactory.createForClass(Items);
