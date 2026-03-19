import { Module } from '@nestjs/common';
import { JoinRequestsController } from './join-requests.controller';
import { JoinRequestsService } from './join-requests.service';
import { PrismaService } from '../prisma.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [JoinRequestsController],
  providers: [JoinRequestsService, PrismaService],
  exports: [JoinRequestsService],
})
export class JoinRequestsModule {}
