import { Controller, Post, Body, Get, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
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

  @Post('login')
  @ApiOperation({ summary: 'Password login', description: 'Login with email and password' })
  async login(@Body() loginDto: any) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile', description: 'Returns the authenticated user from the JWT' })
  getProfile(@Request() req) {
    return req.user;
  }
}
