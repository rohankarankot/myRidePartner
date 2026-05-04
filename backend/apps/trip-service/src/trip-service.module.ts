import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { TripRemindersTask } from './trip-reminders.task';
import { PrismaModule } from '@app/common';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ClientsModule.register([
      {
        name: 'API_GATEWAY',
        transport: Transport.TCP,
        options: {
          host: process.env.API_GATEWAY_HOST || 'localhost',
          port: 4000,
        },
      },
      {
        name: 'NOTIFICATION_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.NOTIFICATION_SERVICE_HOST || 'localhost',
          port: 4005,
        },
      },
      {
        name: 'CHAT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.CHAT_SERVICE_HOST || 'localhost',
          port: 4004,
        },
      },
    ]),
  ],
  controllers: [TripsController],
  providers: [TripsService, TripRemindersTask],
})
export class TripServiceModule {}
