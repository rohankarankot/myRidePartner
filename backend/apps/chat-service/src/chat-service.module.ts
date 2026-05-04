import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TripChatsController } from './trip-chats.controller';
import { TripChatsService } from './trip-chats.service';
import { PrismaModule, UploadModule } from '@app/common';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UploadModule,
    ClientsModule.register([
      {
        name: 'API_GATEWAY',
        transport: Transport.TCP,
        options: {
          host: '0.0.0.0',
          port: 4000,
        },
      },
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
  controllers: [TripChatsController],
  providers: [TripChatsService],
})
export class ChatServiceModule {}
