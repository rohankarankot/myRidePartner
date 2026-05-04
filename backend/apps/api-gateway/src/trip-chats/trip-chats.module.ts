import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TripChatsController } from './trip-chats.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'CHAT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: '0.0.0.0',
          port: 4004,
        },
      },
    ]),
  ],
  controllers: [TripChatsController],
  exports: [ClientsModule],
})
export class TripChatsModule {}
