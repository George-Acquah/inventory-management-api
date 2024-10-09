import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  //Basically, we use @IsEmail decorator to validate emails but was failing for some reasons
  // @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  constructor(dto: LoginUserDto) {
    Object.assign(this, dto);
  }
}
