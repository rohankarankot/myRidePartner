import { Controller, Post, Body, Get, UseGuards, Request, UnauthorizedException, Inject } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleLoginDto, LoginDto } from './dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(@Inject('AUTH_SERVICE') private readonly authClient: ClientProxy) {}

  @Post('google')
  @ApiOperation({ summary: 'Google login', description: 'Verify a Google ID token and return a JWT access token' })
  @ApiBody({ type: GoogleLoginDto })
  async googleLogin(@Body() googleLoginDto: GoogleLoginDto) {
    try {
      return await firstValueFrom(
        this.authClient.send({ cmd: 'verifyGoogleToken' }, {
          token: googleLoginDto.token,
          source: googleLoginDto.source,
        })
      );
    } catch (e: any) {
      if (e?.message?.includes('Invalid') || e?.message?.includes('blocked')) {
        throw new UnauthorizedException(e.message);
      }
      throw e;
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'Password login', description: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto) {
    const user = await firstValueFrom(
      this.authClient.send({ cmd: 'validateUser' }, {
        email: loginDto.email,
        pass: loginDto.password,
      })
    );
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    return firstValueFrom(
      this.authClient.send({ cmd: 'login' }, {
        user,
        source: loginDto.source,
      })
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile', description: 'Returns the authenticated user from the JWT' })
  getProfile(@Request() req) {
    return req.user;
  }
}
