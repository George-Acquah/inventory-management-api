import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword
} from 'class-validator';
import { IsPhoneNumber } from 'src/shared/validators/phone-number.validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @IsStrongPassword()
  password: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsPhoneNumber()
  phoneNumber: string;

  //Assign the fileds to the constructor, Useful when you want to manipulate the dto
  constructor(dto: CreateUserDto) {
    Object.assign(this, dto);
  }
}
