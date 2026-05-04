import { Controller, Get, Param, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@ApiTags('Public Trips')
@Controller('public/trips')
export class PublicTripsController {
  constructor(@Inject('TRIP_SERVICE') private readonly tripClient: ClientProxy) {}

  @Get(':documentId')
  @ApiOperation({
    summary: 'Get public trip details by document ID',
    description: 'Returns a safe public payload for shared ride links.',
  })
  @ApiParam({ name: 'documentId', description: 'UUID document ID of the trip' })
  async findOne(@Param('documentId') documentId: string) {
    return firstValueFrom(this.tripClient.send({ cmd: 'findPublicByDocumentId' }, { documentId }));
  }
}
