import { Module } from '@nestjs/common';
import { PrismaService } from '@app/common';
import { CommunityGroupsController } from './community-groups.controller';
import { CommunityGroupsService } from './community-groups.service';
import { CommunityCleanupTask } from './community-cleanup.task';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [EventsModule],
  controllers: [CommunityGroupsController],
  providers: [CommunityGroupsService, CommunityCleanupTask, PrismaService],
  exports: [CommunityGroupsService],
})
export class CommunityGroupsModule {}
