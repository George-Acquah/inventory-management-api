import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { _IPayload } from 'src/shared/interfaces/jwt_payload.interface';
import { strategies } from 'src/shared/constants/auth.constants';
import { AuthService } from 'src/routes/auth/auth.service';
import { Injectable } from '@nestjs/common/decorators/core/injectable.decorator';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';
import { PassportStrategy } from '@nestjs/passport/dist/passport/passport.strategy';

@Injectable()
export class RefreshStrategy extends PassportStrategy(
  Strategy,
  strategies.REFRESH
) {
  constructor(private authService: AuthService) {
    super({
      ignoreExpiration: false,
      secretOrKey: process.env.REFRESH_KEY,
      jwtFromRequest: (request: Request) => {
        const authHeader = request.headers.authorization;
        console.log(authHeader);
        if (authHeader && authHeader.split(' ')[0] === 'Refresh') {
          return authHeader.split(' ')[1];
        }
        return undefined;
      }
    });
  }

  async validate(payload: _IPayload) {
    const user = await this.authService.verifyUser(payload);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
