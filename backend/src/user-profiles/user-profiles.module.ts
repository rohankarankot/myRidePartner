import { Module } from '@nestjs/common';
import { UserProfilesService } from './user-profiles.service';
import { UserProfilesController } from './user-profiles.controller';
import { PrismaService } from '@app/common';

@Module({
  controllers: [UserProfilesController],
  providers: [UserProfilesService, PrismaService],
  exports: [UserProfilesService],
})
export class UserProfilesModule {}
