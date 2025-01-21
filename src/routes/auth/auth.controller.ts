import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/shared/dtos/users/create-users.dto';
import { LoginUserDto } from 'src/shared/dtos/users/login-users.dtos';
import { RefreshJwtAuthGuard } from 'src/shared/guards/refreshJwt.guard';
import { ApiResponse } from 'src/shared/res/api.response';
import { User } from 'src/shared/decorators/user.decorator';
import { UsersService } from '../users/users.service';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService
  ) {}

  @Post('users/register')
  async registerUser(@Body() data: CreateUserDto) {
    try {
      console.log(data.password);
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
