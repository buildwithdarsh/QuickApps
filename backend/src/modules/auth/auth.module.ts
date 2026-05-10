import { Module, Logger } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';

const googleProvider = {
  provide: GoogleStrategy,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const clientId = config.get<string>('google.clientId');
    if (!clientId) {
      Logger.warn('Google OAuth disabled — GOOGLE_CLIENT_ID not set', 'AuthModule');
      return null;
    }
    return new GoogleStrategy(config);
  },
};

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.secret', 'fallback-secret'),
        signOptions: {
          expiresIn: config.get<string>('jwt.accessExpiry', '15m') as any,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, googleProvider],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
