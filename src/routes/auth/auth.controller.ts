import {
  Body,
  Controller,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { MailService } from '../mail/mail.service';
import { CreateUserDto } from 'src/shared/dtos/users/create-users.dto';
import { LoginUserDto } from 'src/shared/dtos/users/login-users.dtos';
import { RefreshJwtAuthGuard } from 'src/shared/guards/refreshJwt.guard';
import { ApiResponse } from 'src/shared/res/api.response';
import { User } from 'src/shared/decorators/user.decorator';
import { UsersService } from '../users/users.service';
import { AccountVerificationService } from '../verify-account/verify-account.service';
import { VerifyAccountQueryDto } from 'src/shared/dtos/users/verify-account.dto';
// import { LocalJwtAuthGuard } from 'src/shared/guards/local-jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly mailService: MailService,
    private readonly accountVerificationService: AccountVerificationService
  ) {}
  @Post('users/register')
  async registerUser(@Body() data: CreateUserDto) {
    try {
      const result = await this.userService.createUser(data);

      if (!result) {
        return new ApiResponse(
          400,
          'Something Bad Occured while creating your account',
          {}
        );
      }

      //We destructure _id and send whatever remains in the result as owner
      const { _id, ...user } = result;
      console.log(_id);

      const verificationToken =
        await this.accountVerificationService.createVerificationToken(
          user.email
        );
      await this.mailService.sendAccountVerificationToken(
        user.email,
        'some-user-name',
        verificationToken
      );

      return new ApiResponse(
        200,
        `You have successfully created an acount with ${user.email}`,
        user
      );
    } catch (error) {
      return new ApiResponse(
        error.status ?? 400,
        error.message ?? 'Something Bad Occured while creating your account',
        {}
      );
    }
  }

  // @UseGuards(LocalJwtAuthGuard)
  @Post('users/login')
  async login(@Body() userDto: LoginUserDto) {
    try {
      const data = await this.authService.login(userDto);

      if (data) {
        return new ApiResponse(
          200,
          `You have Successfully logged in as ${data.user.email}`,
          data
        );
      }
    } catch (error) {
      console.log(error);
      return new ApiResponse(
        error?.response?.statusCode ?? 400,
        error?.message ?? 'Something Bad Occured while logging in',
        {}
      );
    }
  }

  @Post('account/verify')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async verifyAccount(@Query() query: VerifyAccountQueryDto) {
    try {
      const { code, email } = query; // Destructure the validated query parameters
      const response = await this.authService.verifyAccount(code, email);

      return new ApiResponse(
        200,
        `Your account has successfully been verified`,
        response
      );
    } catch (error) {
      return new ApiResponse(
        error.status ?? 400,
        error.message ?? 'Something bad occurred while verifying your account',
        {}
      );
    }
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Post('refresh')
  async refreshToken(@User() user: _ISafeUser) {
    try {
      const tokens = await this.authService.refreshToken(user);
      console.log('Session successfully refreshed');
      return new ApiResponse(200, 'Session successfully refreshed', tokens);
    } catch (error) {
      return new ApiResponse(400, error.message ?? "Couldn't refresh", {});
    }
  }
}
