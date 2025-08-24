import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtAuthModule } from 'src/modules/jwt.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from 'src/shared/jwt/jwt.strategy';
import { LocalJwtStrategy } from 'src/shared/jwt/local.jwt.strategy';
import { RefreshStrategy } from 'src/shared/jwt/refresh.jwt.strategy';
import { Module } from '@nestjs/common/decorators/modules/module.decorator';
import { ConfigService } from '@nestjs/config/dist/config.service';
import {
  JwtAuthGuard,
  LocalJwtAuthGuard,
  RefreshJwtAuthGuard
} from 'src/shared/guards';

@Module({
  imports: [UsersModule, JwtAuthModule, PassportModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    ConfigService,
    JwtStrategy,
    LocalJwtStrategy,
    RefreshStrategy,
    JwtAuthGuard,
    LocalJwtAuthGuard,
    RefreshJwtAuthGuard
  ]
})
export class AuthModule {}
