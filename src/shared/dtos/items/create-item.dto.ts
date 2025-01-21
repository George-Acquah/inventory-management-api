import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsEnum
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ITEM_SEX_TYPE, ITEM_ZONE } from 'src/shared/enums/general.enum';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  itemName: string;

  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseFloat(value))
  price: number;

  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseInt(value))
  stock: number;

  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseFloat(value))
  lastPrice: number;

  @IsEnum(ITEM_ZONE)
  zone: ITEM_ZONE;

  @IsEnum(ITEM_SEX_TYPE)
  sexType: ITEM_SEX_TYPE;
}
