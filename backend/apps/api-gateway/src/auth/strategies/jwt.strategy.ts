import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UserAccountStatus } from '@prisma/client';
import { firstValueFrom } from 'rxjs';

import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    private configService: ConfigService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('CRITICAL ERROR: JWT_SECRET environment variable is missing!');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    const user: any = await firstValueFrom(this.userClient.send({ cmd: 'findById' }, payload.sub));
    if (!user || user.accountStatus === UserAccountStatus.PAUSED || user.blocked) {
      throw new UnauthorizedException();
    }
    return {
      ...user,
      authSource: payload.source ?? 'myridepartner',
    };
  }
}
