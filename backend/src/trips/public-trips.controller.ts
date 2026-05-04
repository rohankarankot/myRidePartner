import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

@ApiTags('Public Trips')
@Controller('public/trips')
export class PublicTripsController {
  @Get(':documentId')
  @ApiOperation({
    summary: 'Get public trip details by document ID',
    description: 'Returns a safe public payload for shared ride links.',
  })
  @ApiParam({ name: 'documentId', description: 'UUID document ID of the trip' })
  async findOne(@Param('documentId') documentId: string) {
    return { documentId };
  }
}
