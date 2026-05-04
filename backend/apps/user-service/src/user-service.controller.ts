import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';

@Controller()
export class UserServiceController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern({ cmd: 'findByEmail' })
  async findByEmail(@Payload() email: string) {
    return this.usersService.findByEmail(email);
  }

  @MessagePattern({ cmd: 'findById' })
  async findById(@Payload() id: number) {
    return this.usersService.findById(id);
  }

  @MessagePattern({ cmd: 'updateUser' })
  async update(@Payload() payload: { id: number; data: any }) {
    return this.usersService.update(payload.id, payload.data);
  }

  @MessagePattern({ cmd: 'pauseAccount' })
  async pauseAccount(@Payload() id: number) {
    return this.usersService.pauseAccount(id);
  }

  @MessagePattern({ cmd: 'reactivateAccount' })
  async reactivateAccount(@Payload() id: number) {
    return this.usersService.reactivateAccount(id);
  }

  @MessagePattern({ cmd: 'deleteAccount' })
  async deleteAccount(@Payload() id: number) {
    return this.usersService.deleteAccount(id);
  }

  @MessagePattern({ cmd: 'getUserAnalytics' })
  async getUserAnalytics(@Payload() id: number) {
    return this.usersService.getUserAnalytics(id);
  }

  @MessagePattern({ cmd: 'getBlockedUserIds' })
  async getBlockedUserIds(@Payload() id: number) {
    return this.usersService.getBlockedUserIds(id);
  }

  @MessagePattern({ cmd: 'getCommunityMembers' })
  async getCommunityMembers(
    @Payload() payload: { userId: number; options?: { page?: number; pageSize?: number; city?: string } },
  ) {
    return this.usersService.getCommunityMembers(payload.userId, payload.options);
  }

  @MessagePattern({ cmd: 'getCommunityMemberCities' })
  async getCommunityMemberCities(@Payload() userId: number) {
    return this.usersService.getCommunityMemberCities(userId);
  }

  @MessagePattern({ cmd: 'blockUser' })
  async blockUser(@Payload() payload: { blockerId: number; blockedUserId: number }) {
    return this.usersService.blockUser(payload.blockerId, payload.blockedUserId);
  }

  @MessagePattern({ cmd: 'unblockUser' })
  async unblockUser(@Payload() payload: { blockerId: number; blockedUserId: number }) {
    return this.usersService.unblockUser(payload.blockerId, payload.blockedUserId);
  }

  @MessagePattern({ cmd: 'createWithGoogle' })
  async createWithGoogle(@Payload() payload: { email: string; name: string; picture: string }) {
    return this.usersService.createWithGoogle(payload.email, payload.name, payload.picture);
  }

  @MessagePattern({ cmd: 'ensureAppSourceAccess' })
  async ensureAppSourceAccess(@Payload() payload: { userId: number; source: string }) {
    return this.usersService.ensureAppSourceAccess(payload.userId, payload.source);
  }
}
