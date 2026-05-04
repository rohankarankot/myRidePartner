import { Module } from '@nestjs/common';
import { TripChatsController } from './trip-chats.controller';
import { TripChatsService } from './trip-chats.service';
import { PrismaService } from '../prisma.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [NotificationsModule, UploadModule],
  controllers: [TripChatsController],
  providers: [TripChatsService, PrismaService],
  exports: [TripChatsService],
})
export class TripChatsModule {}
