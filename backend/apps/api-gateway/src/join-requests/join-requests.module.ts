import { Module } from '@nestjs/common';
import { JoinRequestsController } from './join-requests.controller';
import { JoinRequestsService } from './join-requests.service';
import { PrismaService } from '@app/common';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [JoinRequestsController],
  providers: [JoinRequestsService, PrismaService],
  exports: [JoinRequestsService],
})
export class JoinRequestsModule {}
