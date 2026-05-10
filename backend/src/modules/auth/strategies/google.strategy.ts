import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>('google.clientId', ''),
      clientSecret: config.get<string>('google.clientSecret', ''),
      callbackURL: config.get<string>('google.callbackUrl', ''),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const { id, name, emails, photos } = profile;

    const user = {
      googleId: id,
      email: emails?.[0]?.value || '',
      name: `${name?.givenName || ''} ${name?.familyName || ''}`.trim(),
      avatarUrl: photos?.[0]?.value || null,
    };

    done(null, user);
  }
}
