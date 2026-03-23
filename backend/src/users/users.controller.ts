import { Controller, Delete, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
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

  @Get('me/blocks')
  @ApiOperation({ summary: 'List blocked users for the current authenticated user' })
  async getMyBlockedUsers(@Req() req: any) {
    const blockedUserIds = await this.usersService.getBlockedUserIds(req.user.id);
    return { data: blockedUserIds };
  }

  @Post('me/blocks/:blockedUserId')
  @ApiOperation({ summary: 'Block a user for the current authenticated user' })
  async blockUser(
    @Req() req: any,
    @Param('blockedUserId', ParseIntPipe) blockedUserId: number,
  ) {
    await this.usersService.blockUser(req.user.id, blockedUserId);
    return { message: 'User blocked successfully' };
  }

  @Delete('me/blocks/:blockedUserId')
  @ApiOperation({ summary: 'Unblock a user for the current authenticated user' })
  async unblockUser(
    @Req() req: any,
    @Param('blockedUserId', ParseIntPipe) blockedUserId: number,
  ) {
    await this.usersService.unblockUser(req.user.id, blockedUserId);
    return { message: 'User unblocked successfully' };
  }
}
