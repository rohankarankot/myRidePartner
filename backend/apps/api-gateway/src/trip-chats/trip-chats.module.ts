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
          host: process.env.CHAT_SERVICE_HOST || 'localhost',
          port: 4004,
        },
      },
    ]),
  ],
  controllers: [TripChatsController],
  exports: [ClientsModule],
})
export class TripChatsModule {}
