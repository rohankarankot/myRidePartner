import { Module, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NotificationsController } from './notifications.controller';

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'NOTIFICATION_SERVICE',
        transport: Transport.TCP,
        options: {
          host: '0.0.0.0',
          port: 4005,
        },
      },
    ]),
  ],
  controllers: [NotificationsController],
  exports: [ClientsModule],
})
export class NotificationsModule {}
