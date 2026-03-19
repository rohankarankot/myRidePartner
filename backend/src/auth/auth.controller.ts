import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleLoginDto } from './dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google')
  @ApiOperation({ summary: 'Google login', description: 'Verify a Google ID token and return a JWT access token' })
  @ApiBody({ type: GoogleLoginDto })
  async googleLogin(@Body('token') token: string) {
    return this.authService.verifyGoogleToken(token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile', description: 'Returns the authenticated user from the JWT' })
  getProfile(@Request() req) {
    return req.user;
  }
}
