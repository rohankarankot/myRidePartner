import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { OAuth2Client } from 'google-auth-library';
import * as bcrypt from 'bcrypt';
import { UserAccountStatus } from '@prisma/client';

import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;
  private readonly defaultAuthSource = 'myridepartner';
  private readonly googleAudiences: string[];
  private readonly supportEmail: string;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
    this.googleAudiences = this.getGoogleAudiences();
    this.supportEmail =
      this.configService.get<string>('SUPPORT_EMAIL') ||
      'rohan.alwayscodes@gmail.com';
  }

  async verifyGoogleToken(token: string, source?: string) {
    const normalizedSource = this.normalizeSource(source);

    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: this.googleAudiences.length > 0 ? this.googleAudiences : undefined,
      });
      const payload = ticket.getPayload();
      
      if (!payload || !payload.email) {
        throw new UnauthorizedException('Invalid Google token payload');
      }

      const { email, name, picture } = payload;
      let user = await this.usersService.findByEmail(email);

      if (!user) {
        user = await this.usersService.createWithGoogle(email, name || '', picture || '');
      } else if (user.accountStatus === UserAccountStatus.PAUSED) {
        user = await this.usersService.reactivateAccount(user.id);
      }

      this.assertUserCanLogin(user);

      await this.usersService.ensureAppSourceAccess(user.id, normalizedSource);

      return {
        access_token: this.jwtService.sign({
          email: user.email,
          sub: user.id,
          role: user.role,
          source: normalizedSource,
        }),
        source: normalizedSource,
        user,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      console.error('Google token verification failed:', error);
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  async validateUser(email: string, pass: string): Promise<any> {
    let user = await this.usersService.findByEmail(email);
    if (user && user.password && await bcrypt.compare(pass, user.password)) {
      if (user.accountStatus === UserAccountStatus.PAUSED) {
        user = await this.usersService.reactivateAccount(user.id);
      }

      this.assertUserCanLogin(user);

      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any, source?: string) {
    const normalizedSource = this.normalizeSource(source);

    await this.usersService.ensureAppSourceAccess(user.id, normalizedSource);

    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      source: normalizedSource,
    };

    return {
      access_token: this.jwtService.sign(payload),
      source: normalizedSource,
      user,
    };
  }

  private normalizeSource(source?: string) {
    const normalized = source?.trim().toLowerCase() || this.defaultAuthSource;
    return normalized.replace(/[^a-z0-9._-]/g, '-');
  }

  private getGoogleAudiences() {
    const configured = [
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_IDS'),
    ]
      .filter(Boolean)
      .flatMap((value) => value!.split(','))
      .map((value) => value.trim())
      .filter(Boolean);

    return Array.from(new Set(configured));
  }

  private assertUserCanLogin(user: { blocked?: boolean }) {
    if (user.blocked) {
      throw new UnauthorizedException(
        `Your account has been blocked. If you want to unblock it, contact support at ${this.supportEmail}.`,
      );
    }
  }
}
