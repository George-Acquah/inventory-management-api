import { Prop } from '@nestjs/mongoose/dist/decorators/prop.decorator';
import { Schema } from '@nestjs/mongoose/dist/decorators/schema.decorator';
import { HydratedDocument, Document } from 'mongoose';

export type TransactionsDocument = HydratedDocument<Transactions>;

@Schema({
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  timestamps: true
})
export class Transactions extends Document {
  @Prop({
    required: true,
    type: [
      {
        itemId: { type: String, required: true },
        itemName: { type: String, required: true },
        quantity: { type: Number, required: true },
        soldPrice: { type: Number, required: true }
      }
    ]
  })
  items: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    soldPrice: number;
  }>;

  @Prop({ required: true, type: String })
  soldByName: string;

  @Prop({ required: true, type: Number })
  totalPrice: number;

  @Prop({ required: true, type: String })
  soldById: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}
