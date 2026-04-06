import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { TripsService } from './trips.service';

@ApiTags('Public Trips')
@Controller('public/trips')
export class PublicTripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get(':documentId')
  @ApiOperation({
    summary: 'Get public trip details by document ID',
    description: 'Returns a safe public payload for shared ride links.',
  })
  @ApiParam({ name: 'documentId', description: 'UUID document ID of the trip' })
  findOne(@Param('documentId') documentId: string) {
    return this.tripsService.findPublicByDocumentId(documentId);
  }
}
