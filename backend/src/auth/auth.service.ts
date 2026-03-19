import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
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
      }

      return {
        access_token: this.jwtService.sign({ email: user.email, sub: user.id }),
        user,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid Google token');
    }
  }
}

