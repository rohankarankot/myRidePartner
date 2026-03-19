import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { JoinRequestsService } from './join-requests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateJoinRequestDto, UpdateJoinRequestStatusDto } from './dto/join-requests.dto';

@ApiTags('Join Requests')
@ApiBearerAuth()
@Controller('join-requests')
@UseGuards(JwtAuthGuard)
export class JoinRequestsController {
  constructor(private readonly joinRequestsService: JoinRequestsService) {}

  @Get()
  @ApiOperation({ summary: 'Get join requests for a trip' })
  @ApiQuery({ name: 'tripDocumentId', required: true, description: 'Trip document ID' })
  findByTrip(@Query('tripDocumentId') tripDocumentId: string) {
    return this.joinRequestsService.findByTrip(tripDocumentId);
  }

  @Get('pending/:captainId')
  @ApiOperation({ summary: 'Get pending requests for a captain', description: 'Get all pending join requests where the user is the trip captain' })
  @ApiParam({ name: 'captainId', example: 1 })
  findPendingForCaptain(@Param('captainId') captainId: string) {
    return this.joinRequestsService.findPendingForCaptain(parseInt(captainId, 10));
  }

  @Get(':documentId')
  @ApiOperation({ summary: 'Get a join request by document ID' })
  @ApiParam({ name: 'documentId' })
  findOne(@Param('documentId') documentId: string) {
    return this.joinRequestsService.findByDocumentId(documentId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a join request' })
  @ApiBody({ type: CreateJoinRequestDto })
  create(@Body() body: { trip: string; passenger: number; requestedSeats: number; message?: string }) {
    return this.joinRequestsService.create(body);
  }

  @Put(':documentId/status')
  @ApiOperation({ summary: 'Update join request status', description: 'Approve, reject, or cancel a join request' })
  @ApiParam({ name: 'documentId' })
  @ApiBody({ type: UpdateJoinRequestStatusDto })
  updateStatus(
    @Param('documentId') documentId: string,
    @Body() body: { status: string },
  ) {
    return this.joinRequestsService.updateStatus(documentId, body.status as any);
  }
}
