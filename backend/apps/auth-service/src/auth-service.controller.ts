import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Controller()
export class AuthServiceController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'verifyGoogleToken' })
  async verifyGoogleToken(@Payload() payload: { token: string; source?: string }) {
    return this.authService.verifyGoogleToken(payload.token, payload.source);
  }

  @MessagePattern({ cmd: 'validateUser' })
  async validateUser(@Payload() payload: { email: string; pass: string }) {
    return this.authService.validateUser(payload.email, payload.pass);
  }

  @MessagePattern({ cmd: 'login' })
  async login(@Payload() payload: { user: any; source?: string }) {
    return this.authService.login(payload.user, payload.source);
  }
}
