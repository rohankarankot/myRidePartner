import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserAccountStatus } from '@prisma/client';

import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error(
        'CRITICAL ERROR: JWT_SECRET environment variable is missing!',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    const user: any = {
      id: payload.sub,
      accountStatus: UserAccountStatus.ACTIVE,
      blocked: false,
    };
    if (
      !user ||
      user.accountStatus === UserAccountStatus.PAUSED ||
      user.blocked
    ) {
      throw new UnauthorizedException();
    }
    return {
      ...user,
      authSource: payload.source ?? 'myridepartner',
    };
  }
}
