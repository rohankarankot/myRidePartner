import { Controller, Delete, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user' })
  getCurrentUser(@Req() req: any) {
    return req.user;
  }

  @Post('me/account/pause')
  @ApiOperation({ summary: 'Pause the current user account' })
  async pauseAccount(@Req() req: any) {
    throw new BadRequestException('User account actions are temporarily unavailable while the monolith user service is restored');
  }

  @Delete('me')
  @ApiOperation({ summary: 'Permanently delete the current user account' })
  async deleteAccount(@Req() req: any) {
    throw new BadRequestException('User account actions are temporarily unavailable while the monolith user service is restored');
  }

  @Get('me/analytics')
  @ApiOperation({ summary: 'Get analytics for the current authenticated user' })
  async getMyAnalytics(@Req() req: any) {
    throw new BadRequestException('User analytics are temporarily unavailable while the monolith user service is restored');
  }

  @Get('me/blocks')
  @ApiOperation({ summary: 'List blocked users for the current authenticated user' })
  async getMyBlockedUsers(@Req() req: any) {
    throw new BadRequestException('Blocked-user lookups are temporarily unavailable while the monolith user service is restored');
  }

  @Get('community-members')
  @ApiOperation({ summary: 'List community chat members' })
  async getCommunityMembers(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('city') city?: string,
  ) {
    throw new BadRequestException('Community member lookup is temporarily unavailable while the monolith user service is restored');
  }

  @Get('community-members/cities')
  @ApiOperation({ summary: 'List available cities for community chat members' })
  async getCommunityMemberCities(@Req() req: any) {
    throw new BadRequestException('Community member cities are temporarily unavailable while the monolith user service is restored');
  }

  @Post('me/blocks/:blockedUserId')
  @ApiOperation({ summary: 'Block a user for the current authenticated user' })
  async blockUser(
    @Req() req: any,
    @Param('blockedUserId', ParseIntPipe) blockedUserId: number,
  ) {
    throw new BadRequestException('User blocking is temporarily unavailable while the monolith user service is restored');
  }

  @Delete('me/blocks/:blockedUserId')
  @ApiOperation({ summary: 'Unblock a user for the current authenticated user' })
  async unblockUser(
    @Req() req: any,
    @Param('blockedUserId', ParseIntPipe) blockedUserId: number,
  ) {
    throw new BadRequestException('User unblocking is temporarily unavailable while the monolith user service is restored');
  }
}
