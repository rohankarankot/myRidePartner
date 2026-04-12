import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CommunityGroupsController } from './community-groups.controller';
import { CommunityGroupsService } from './community-groups.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { CommunityCleanupTask } from './community-cleanup.task';

@Module({
  imports: [NotificationsModule],
  controllers: [CommunityGroupsController],
  providers: [CommunityGroupsService, CommunityCleanupTask, PrismaService],
  exports: [CommunityGroupsService],
})
export class CommunityGroupsModule {}
