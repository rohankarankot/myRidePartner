import { Module } from '@nestjs/common';
import { TripChatsController } from './trip-chats.controller';
import { TripChatsService } from './trip-chats.service';
import { PrismaService } from '../prisma.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [TripChatsController],
  providers: [TripChatsService, PrismaService],
  exports: [TripChatsService],
})
export class TripChatsModule {}
