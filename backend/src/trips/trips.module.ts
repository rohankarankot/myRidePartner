import { Module } from '@nestjs/common';
import { PublicTripsController } from './public-trips.controller';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { PrismaService } from '../prisma.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { TripChatsModule } from '../trip-chats/trip-chats.module';

@Module({
  imports: [NotificationsModule, TripChatsModule],
  controllers: [TripsController, PublicTripsController],
  providers: [TripsService, PrismaService],
  exports: [TripsService],
})
export class TripsModule {}
