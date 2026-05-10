import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../database/prisma.service';
import { JwtPayload } from '../../../common/decorators';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.secret', 'fallback-secret'),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: payload.sub,
        orgId: payload.orgId,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found or deactivated');
    }

    return {
      sub: payload.sub,
      email: payload.email,
      orgId: payload.orgId,
      role: payload.role,
    };
  }
}
