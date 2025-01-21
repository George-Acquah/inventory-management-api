import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  ValidateNested,
  ArrayNotEmpty
} from 'class-validator';
import { Type } from 'class-transformer';

class ItemDto {
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @IsString()
  @IsNotEmpty()
  itemName: string;

  @IsNumber()
  @IsPositive()
  soldPrice: number;

  @IsNumber()
  @IsPositive()
  quantity: number;
}

export class CreateTransactionDto {
  @ArrayNotEmpty() // Ensures there is at least one item in the array
  @ValidateNested({ each: true }) // Validates each item in the array
  @Type(() => ItemDto) // Transforms plain objects into instances of ItemDto
  items: ItemDto[];

  @IsNumber()
  @IsPositive()
  totalPrice: number;
}
