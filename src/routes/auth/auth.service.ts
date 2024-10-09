import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import {
  _IPayload,
  _ITokens,
  _TJwtPayload
} from 'src/shared/interfaces/jwt_payload.interface';
import { sign, verify } from 'jsonwebtoken';
import { compare } from 'bcrypt';
import { sanitizeLoginUserFn } from 'src/shared/helpers/users.sanitizers';
import { LoginUserDto } from 'src/shared/dtos/users/login-users.dtos';
import { getExpirationTime } from 'src/shared/utils/users.utils';
import { AccountVerificationService } from '../verify-account/verify-account.service';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);
  constructor(
    private userService: UsersService,
    private accountVerificationService: AccountVerificationService
  ) {}
  async signPayload(payload: _IPayload, secret: string, exp: string) {
    return sign(payload, secret, { expiresIn: exp });
  }

  async verifyToken(token: string, secret: string): Promise<_IPayload> {
    const tokenPayload = verify(token, secret) as _TJwtPayload;
    return {
      sub: {
        email: tokenPayload.sub.email
      },
      user_id: tokenPayload.user_id
    };
  }

  /**
   * Verify Account
   *
   * Validates the provided verification token and email, updates the user's verification status
   * if the token is valid and the email matches, and optionally removes the verification record.
   *
   * @param {string} token - The verification token sent to the user.
   * @param {string} email - The email address to verify.
   * @returns {Promise<{ message: string; user: { email: string; userType: UserType; isVerified: boolean; } }>}
   */
  async verifyAccount(token: string, email: string) {
    try {
      // Fetch the verification record from the database using the token and email
      const verificationRecord =
        await this.accountVerificationService.findAccountVerificationRecord(
          token,
          email
        );

      if (!verificationRecord) {
        throw new NotFoundException(
          'Verification record not found or already used'
        );
      }

      // Find the user by email and check if they exist
      const user = await this.userService.findUser(email);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.isVerified) {
        throw new BadRequestException('User is already verified');
      }

      // Mark the user as verified
      user.isVerified = true;
      await user.save();

      // Optionally remove the verification record to clean up
      await this.accountVerificationService.deleteAccountVerificationRecord(
        verificationRecord._id
      );

      return {
        email: user.email,
        isVerified: user.isVerified
      };
    } catch (error) {
      console.error('Error verifying account:', error);
      throw new BadRequestException(`Verification failed: ${error.message}`);
    }
  }

  async validateUser(email: string, password: string) {
    try {
      const user = await this.userService.findUser(email);
      //Compare password from user to password in DB
      const isValidPassword = await compare(password, user.password);

      if (user && isValidPassword) {
        return sanitizeLoginUserFn(user);
      }

      throw new Error('Wrong Password');
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(user: _ISafeUser) {
    const payload: _IPayload = {
      user_id: user._id?.toString() ?? '',
      sub: {
        email: user.email
      }
    };

    const access_token = await this.signPayload(
      payload,
      process.env.SECRET_KEY,
      '1h'
    );

    const refresh_token = await this.signPayload(
      payload,
      process.env.REFRESH_KEY,
      '12h'
    );

    const expiresIn = getExpirationTime(5);

    const tokens: _ITokens = {
      access_token,
      refresh_token,
      expiresIn
    };

    return {
      tokens
    };
  }

  async login(dto: LoginUserDto) {
    try {
      const { email, password } = dto;
      const user = await this.validateUser(email, password);

      if (!user.isVerified) {
        throw new Error('Please verify your account before logging in');
      }

      const payload: _IPayload = {
        user_id: user._id?.toString() ?? '',
        sub: {
          email: user.email
        }
      };

      const access_token = await this.signPayload(
        payload,
        process.env.SECRET_KEY,
        '1h'
      );

      const refresh_token = await this.signPayload(
        payload,
        process.env.REFRESH_KEY,
        '12h'
      );

      const expiresIn = getExpirationTime(1);

      const tokens: _ITokens = {
        access_token,
        refresh_token,
        expiresIn
      };

      return {
        user,
        tokens
      };
    } catch (error) {
      throw error;
    }
  }

  async findByPayload(payload: _IPayload) {
    const {
      sub: { email }
    } = payload;

    return await this.userService.findUser(email);
  }

  async verifyUser(payload: _IPayload) {
    const user = await this.findByPayload(payload);

    return sanitizeLoginUserFn(user);
  }
}
