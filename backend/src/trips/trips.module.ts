import { Module } from '@nestjs/common';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { PrismaService } from '../prisma.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { TripChatsModule } from '../trip-chats/trip-chats.module';

@Module({
  imports: [NotificationsModule, TripChatsModule],
  controllers: [TripsController],
  providers: [TripsService, PrismaService],
  exports: [TripsService],
})
export class TripsModule {}
