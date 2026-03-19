import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { UserProfilesService } from './user-profiles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Gender } from '@prisma/client';

@Controller('user-profiles')
@UseGuards(JwtAuthGuard)
export class UserProfilesController {
  constructor(private readonly userProfilesService: UserProfilesService) {}

  @Post()
  create(@Body() createData: { fullName: string; phoneNumber: string; gender: Gender; userId: number }) {
    return this.userProfilesService.create(createData);
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.userProfilesService.findByUserId(+userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.userProfilesService.update(+id, updateData);
  }
}
