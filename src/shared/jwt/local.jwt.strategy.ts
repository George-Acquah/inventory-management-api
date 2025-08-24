import { Injectable } from '@nestjs/common/decorators/core/injectable.decorator';
import { UnauthorizedException } from '@nestjs/common/exceptions/unauthorized.exception';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from 'src/routes/auth/auth.service';
import { strategies } from 'src/shared/constants/auth.constants';

@Injectable()
export class LocalJwtStrategy extends PassportStrategy(
  Strategy,
  strategies.LOCAL
) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    console.log({ email, password });
    const user = await this.authService.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
