import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CommunityGroupsController } from './community-groups.controller';
import { CommunityGroupsService } from './community-groups.service';

@Module({
  controllers: [CommunityGroupsController],
  providers: [CommunityGroupsService, PrismaService],
  exports: [CommunityGroupsService],
})
export class CommunityGroupsModule {}
