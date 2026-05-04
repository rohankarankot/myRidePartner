import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TripsController } from './trips.controller';
import { PublicTripsController } from './public-trips.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'TRIP_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.TRIP_SERVICE_HOST || 'localhost',
          port: 4003,
        },
      },
    ]),
  ],
  controllers: [TripsController, PublicTripsController],
  exports: [ClientsModule],
})
export class TripsModule {}
