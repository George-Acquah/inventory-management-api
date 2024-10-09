import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyAccountQueryDto {
  @IsString({ message: 'Verification code must be a string.' })
  @IsNotEmpty({ message: 'Verification code must not be empty.' })
  code: string;

  @IsString({ message: 'Email must be a string.' })
  @IsNotEmpty({ message: 'Email must not be empty.' })
  email: string;
}
