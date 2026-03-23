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

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(this.configService.get<string>('GOOGLE_CLIENT_ID'));
  }

  async verifyGoogleToken(token: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
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

      return {
        access_token: this.jwtService.sign({ email: user.email, sub: user.id, role: user.role }),
        user,
      };
    } catch (error) {
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

      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
