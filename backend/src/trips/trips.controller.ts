import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { TripsService, TripFilters } from './trips.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { parsePagination } from '../common/utils/query.utils';
import { TripStatus, GenderPreference } from '@prisma/client';
import { CreateTripBodyDto, UpdateTripBodyDto } from './dto/trips.dto';

@ApiTags('Trips')
@ApiBearerAuth()
@Controller('trips')
@UseGuards(JwtAuthGuard)
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get()
  @ApiOperation({ summary: 'List trips', description: 'Get a paginated, filtered list of trips' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: TripStatus })
  @ApiQuery({ name: 'gender', required: false, enum: ['men', 'women', 'both'] })
  @ApiQuery({ name: 'date', required: false, example: '2025-03-20' })
  @ApiQuery({ name: 'creatorId', required: false, example: 1 })
  findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: TripStatus,
    @Query('gender') gender?: string,
    @Query('date') date?: string,
    @Query('creatorId') creatorId?: string,
  ) {
    const pagination = parsePagination({ page, pageSize });

    const filters: TripFilters = {};
    if (status) filters.status = status;
    if (gender && gender !== 'both') filters.genderPreference = gender as GenderPreference;
    if (date) filters.date = date;
    if (creatorId) filters.creatorId = parseInt(creatorId, 10);

    return this.tripsService.findAll(pagination, filters);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get trips by user', description: 'Get all trips created by a specific user' })
  @ApiParam({ name: 'userId', example: 1 })
  findByUser(@Param('userId') userId: string) {
    return this.tripsService.findByCreatorId(parseInt(userId, 10));
  }

  @Get(':documentId')
  @ApiOperation({ summary: 'Get trip by document ID' })
  @ApiParam({ name: 'documentId', description: 'UUID document ID of the trip' })
  findOne(@Param('documentId') documentId: string) {
    return this.tripsService.findByDocumentId(documentId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a trip' })
  @ApiBody({ type: CreateTripBodyDto })
  create(@Body() body: { data: any }) {
    return this.tripsService.create(body.data);
  }

  @Put(':documentId')
  @ApiOperation({ summary: 'Update a trip' })
  @ApiParam({ name: 'documentId', description: 'UUID document ID of the trip' })
  @ApiBody({ type: UpdateTripBodyDto })
  update(
    @Param('documentId') documentId: string,
    @Body() body: { data: any },
  ) {
    return this.tripsService.update(documentId, body.data);
  }

  @Post(':documentId/actions/publish')
  @ApiOperation({ summary: 'Publish a trip', description: 'No-op compatibility endpoint — returns 200' })
  @ApiParam({ name: 'documentId' })
  publish(@Param('documentId') documentId: string) {
    return { message: 'Published successfully' };
  }

  @Delete(':documentId')
  @ApiOperation({ summary: 'Delete a trip' })
  @ApiParam({ name: 'documentId' })
  remove(@Param('documentId') documentId: string) {
    return this.tripsService.delete(documentId);
  }
}
