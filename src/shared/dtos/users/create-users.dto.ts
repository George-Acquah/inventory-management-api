import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  //We inject the email field with the @IsEmail decorator
  @IsEmail()
  email: string;

  //We inject the email field with these decorator
  //Alternatively, we could use the @IsPassword
  @IsNotEmpty()
  @IsString()
  password: string;

  //Assign the fileds to the constructor, Useful when you want to manipulate the dto
  constructor(dto: CreateUserDto) {
    Object.assign(this, dto);
  }
}
