import { Controller, Delete, Get, Inject, Param, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(@Inject('USER_SERVICE') private readonly userClient: ClientProxy) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user' })
  getCurrentUser(@Req() req: any) {
    return req.user;
  }

  @Post('me/account/pause')
  @ApiOperation({ summary: 'Pause the current user account' })
  async pauseAccount(@Req() req: any) {
    await firstValueFrom(this.userClient.send({ cmd: 'pauseAccount' }, req.user.id));
    return { message: 'Account paused successfully' };
  }

  @Delete('me')
  @ApiOperation({ summary: 'Permanently delete the current user account' })
  async deleteAccount(@Req() req: any) {
    await firstValueFrom(this.userClient.send({ cmd: 'deleteAccount' }, req.user.id));
    return { message: 'Account deleted successfully' };
  }

  @Get('me/analytics')
  @ApiOperation({ summary: 'Get analytics for the current authenticated user' })
  async getMyAnalytics(@Req() req: any) {
    return firstValueFrom(this.userClient.send({ cmd: 'getUserAnalytics' }, req.user.id));
  }

  @Get('me/blocks')
  @ApiOperation({ summary: 'List blocked users for the current authenticated user' })
  async getMyBlockedUsers(@Req() req: any) {
    const blockedUserIds = await firstValueFrom(
      this.userClient.send({ cmd: 'getBlockedUserIds' }, req.user.id)
    );
    return { data: blockedUserIds };
  }

  @Get('community-members')
  @ApiOperation({ summary: 'List community chat members' })
  async getCommunityMembers(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('city') city?: string,
  ) {
    return firstValueFrom(
      this.userClient.send(
        { cmd: 'getCommunityMembers' },
        {
          userId: req.user.id,
          options: {
            page: page ? Number(page) : undefined,
            pageSize: pageSize ? Number(pageSize) : undefined,
            city,
          },
        }
      )
    );
  }

  @Get('community-members/cities')
  @ApiOperation({ summary: 'List available cities for community chat members' })
  async getCommunityMemberCities(@Req() req: any) {
    return firstValueFrom(this.userClient.send({ cmd: 'getCommunityMemberCities' }, req.user.id));
  }

  @Post('me/blocks/:blockedUserId')
  @ApiOperation({ summary: 'Block a user for the current authenticated user' })
  async blockUser(
    @Req() req: any,
    @Param('blockedUserId', ParseIntPipe) blockedUserId: number,
  ) {
    await firstValueFrom(
      this.userClient.send(
        { cmd: 'blockUser' },
        { blockerId: req.user.id, blockedUserId }
      )
    );
    return { message: 'User blocked successfully' };
  }

  @Delete('me/blocks/:blockedUserId')
  @ApiOperation({ summary: 'Unblock a user for the current authenticated user' })
  async unblockUser(
    @Req() req: any,
    @Param('blockedUserId', ParseIntPipe) blockedUserId: number,
  ) {
    await firstValueFrom(
      this.userClient.send(
        { cmd: 'unblockUser' },
        { blockerId: req.user.id, blockedUserId }
      )
    );
    return { message: 'User unblocked successfully' };
  }
}
