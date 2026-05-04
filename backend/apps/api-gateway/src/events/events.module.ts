import { Module, Global } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { EventsController } from './events.controller';
import { AuthModule } from '../auth/auth.module';

@Global()
@Module({
  imports: [AuthModule],
  controllers: [EventsController],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
