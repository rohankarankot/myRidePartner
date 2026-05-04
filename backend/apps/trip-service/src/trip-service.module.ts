import { Module } from '@nestjs/common';
import { TripServiceController } from './trip-service.controller';
import { TripServiceService } from './trip-service.service';

@Module({
  imports: [],
  controllers: [TripServiceController],
  providers: [TripServiceService],
})
export class TripServiceModule {}
