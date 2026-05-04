import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NotificationServiceController } from './notification-service.controller';
import { NotificationsService } from './notifications.service';
import { ExpoPushService } from './expo-push.service';
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
    ]),
  ],
  controllers: [NotificationServiceController],
  providers: [NotificationsService, ExpoPushService],
})
export class NotificationServiceModule {}
