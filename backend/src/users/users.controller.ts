import { Controller, Delete, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user' })
  getCurrentUser(@Req() req: any) {
    return req.user;
  }

  @Post('me/account/pause')
  @ApiOperation({ summary: 'Pause the current user account' })
  async pauseAccount(@Req() req: any) {
    await this.usersService.pauseAccount(req.user.id);
    return { message: 'Account paused successfully' };
  }

  @Delete('me')
  @ApiOperation({ summary: 'Permanently delete the current user account' })
  async deleteAccount(@Req() req: any) {
    await this.usersService.deleteAccount(req.user.id);
    return { message: 'Account deleted successfully' };
  }
}
