import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/shared/dtos/users/create-users.dto';
import { LoginUserDto } from 'src/shared/dtos/users/login-users.dtos';
import { RefreshJwtAuthGuard } from 'src/shared/guards/refreshJwt.guard';
import { User } from 'src/shared/decorators/user.decorator';
import { UsersService } from '../users/users.service';
import { Controller } from '@nestjs/common/decorators/core/controller.decorator';
import { Post } from '@nestjs/common/decorators/http/request-mapping.decorator';
import { Body } from '@nestjs/common/decorators/http/route-params.decorator';
import { UseGuards } from '@nestjs/common/decorators/core/use-guards.decorator';
import { instanceToPlain } from 'class-transformer';
import {
  _ICreateUser,
  _ILoginUser
} from 'src/shared/interfaces/users.interface';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService
  ) {}

  @Post('users/register')
  async registerUser(@Body() data: CreateUserDto) {
    return await this.userService.registerUserAsync(
      instanceToPlain(data) as _ICreateUser
    );
  }

  // @UseGuards(LocalJwtAuthGuard)
  @Post('users/login')
  async login(@Body() userDto: LoginUserDto) {
    return await this.authService.login(
      instanceToPlain(userDto) as _ILoginUser
    );
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Post('refresh')
  async refreshToken(@User() user: _ISafeUser) {
    return await this.authService.refreshToken(user);
  }
}
