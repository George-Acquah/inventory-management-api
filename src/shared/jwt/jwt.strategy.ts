import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { _IPayload } from 'src/shared/interfaces/jwt_payload.interface';
import { strategies } from 'src/shared/constants/auth.constants';
import { ApiResponse } from '../res/api.response';
import { AuthService } from 'src/routes/auth/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, strategies.JWT) {
  constructor(private authService: AuthService) {
    super({
      ignoreExpiration: false,
      secretOrKey: process.env.SECRET_KEY,
      jwtFromRequest: (request: Request) => {
        const authHeader = request.headers.authorization;
        if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
          return authHeader.split(' ')[1];
        }
        return undefined;
      }
    });
  }

  async validate(payload: _IPayload) {
    const user = await this.authService.verifyUser(payload);

    if (!user) {
      throw new ApiResponse(402, 'User does not exist', {});
    }

    return user;
  }
}
