import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JoinRequestsController } from './join-requests.controller';
import { JoinRequestsService } from './join-requests.service';
import { PrismaService } from '@app/common';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    EventsModule,
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
  controllers: [JoinRequestsController],
  providers: [JoinRequestsService, PrismaService],
  exports: [JoinRequestsService],
})
export class JoinRequestsModule {}
