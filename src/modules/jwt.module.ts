import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

/**
 * Configures the JWT (JSON Web Token) module based on environment settings.
 * This module dynamically retrieves JWT settings such as the secret and expiration time from the environment configuration.
 *
 * Example Usage:
 *
 * In your main application module (usually AppModule), import the JwtAuthModule to enable JWT authentication.
 *
 * @example
 * import { Module } from '@nestjs/common';
 * import { ConfigModule } from '@nestjs/config';
 * import { JwtAuthModule } from './modules/jwt.module'; // Adjust the path as necessary
 *
 * @Module({
 *   imports: [
 *     ConfigModule.forRoot({ isGlobal: true }), // Load environment variables globally
 *     JwtAuthModule, // Enable JWT authentication
 *   ],
 *   controllers: [],
 *   providers: [],
 * })
 * export class AppModule {}
 *
 * In your service, you can use the JWT module to generate and verify tokens:
 *
 * @example
 * import { Injectable } from '@nestjs/common';
 * import { JwtService } from '@nestjs/jwt';
 *
 * @Injectable()
 * export class AuthService {
 *   constructor(private readonly jwtService: JwtService) {}
 *
 *   async generateToken(user: any) {
 *     // Generate a JWT token for a given user
 *     const payload = { username: user.username, sub: user.userId };
 *     return this.jwtService.sign(payload);
 *   }
 *
 *   async validateToken(token: string) {
 *     // Validate a given JWT token
 *     try {
 *       return this.jwtService.verify(token);
 *     } catch (error) {
 *       throw new Error('Invalid token');
 *     }
 *   }
 * }
 */
const JwtAuthModule = JwtModule.registerAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    // Fetches the JWT secret key from environment variables.
    secret: configService.get<string>('JWT_SECRET'),
    signOptions: {
      // Retrieves the JWT token expiration time from environment variables and parses it as an integer.
      expiresIn: parseInt(configService.get<string>('JWT_EXPIRATION'))
    }
  }),
  /**
   * Injects the ConfigService into the JWT module to allow access to environment configurations.
   */
  inject: [ConfigService]
});

/**
 * Exports the configured JWT module for use in other parts of the application.
 */
export { JwtAuthModule };
