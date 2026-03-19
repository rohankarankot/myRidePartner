import { Module } from '@nestjs/common';
import { UserProfilesService } from './user-profiles.service';
import { UserProfilesController } from './user-profiles.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [UserProfilesController],
  providers: [UserProfilesService, PrismaService],
  exports: [UserProfilesService],
})
export class UserProfilesModule {}
