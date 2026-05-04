import { Controller, Post, Body, Get, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleLoginDto, LoginDto } from './dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  @Post('google')
  @ApiOperation({ summary: 'Google login', description: 'Verify a Google ID token and return a JWT access token' })
  @ApiBody({ type: GoogleLoginDto })
  async googleLogin(@Body() googleLoginDto: GoogleLoginDto) {
    throw new UnauthorizedException('Google login is temporarily unavailable while the monolith auth service is restored');
  }

  @Post('login')
  @ApiOperation({ summary: 'Password login', description: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto) {
    throw new UnauthorizedException('Password login is temporarily unavailable while the monolith auth service is restored');
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile', description: 'Returns the authenticated user from the JWT' })
  getProfile(@Request() req) {
    return req.user;
  }
}
