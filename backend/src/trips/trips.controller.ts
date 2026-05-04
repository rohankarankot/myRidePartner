import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { parsePagination } from '@app/common';
import { TripStatus, GenderPreference } from '@prisma/client';
import { CreateTripBodyDto, UpdateTripBodyDto } from '@app/common';

@ApiTags('Trips')
@ApiBearerAuth()
@Controller('trips')
@UseGuards(JwtAuthGuard)
export class TripsController {
  @Get()
  @ApiOperation({ summary: 'List trips', description: 'Get a paginated, filtered list of trips' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: TripStatus })
  @ApiQuery({ name: 'gender', required: false, enum: ['men', 'women', 'both'] })
  @ApiQuery({ name: 'date', required: false, example: '2025-03-20' })
  @ApiQuery({ name: 'creatorId', required: false, example: 1 })
  @ApiQuery({ name: 'city', required: false, example: 'Pune' })
  @ApiQuery({ name: 'fromQuery', required: false, example: 'Kothrud' })
  @ApiQuery({ name: 'toQuery', required: false, example: 'Hinjewadi' })
  async findAll(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: TripStatus,
    @Query('gender') gender?: string,
    @Query('date') date?: string,
    @Query('creatorId') creatorId?: string,
    @Query('city') city?: string,
    @Query('fromQuery') fromQuery?: string,
    @Query('toQuery') toQuery?: string,
  ) {
    const pagination = parsePagination({ page, pageSize });

    const filters: any = {};
    if (status) filters.status = status;
    if (gender && gender !== 'both') filters.genderPreference = gender as GenderPreference;
    if (date) filters.date = date;
    if (creatorId) filters.creatorId = parseInt(creatorId, 10);
    if (city) filters.city = city;
    if (fromQuery?.trim()) filters.fromQuery = fromQuery.trim();
    if (toQuery?.trim()) filters.toQuery = toQuery.trim();
    if (req?.user?.id) filters.viewerId = req.user.id;

    return { pagination, filters };
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get trips by user', description: 'Get all trips created by a specific user' })
  @ApiParam({ name: 'userId', example: 1 })
  async findByUser(@Req() req: any, @Param('userId') userId: string) {
    return { userId: parseInt(userId, 10), viewerId: req.user.id };
  }

  @Get(':documentId')
  @ApiOperation({ summary: 'Get trip by document ID' })
  @ApiParam({ name: 'documentId', description: 'UUID document ID of the trip' })
  async findOne(@Req() req: any, @Param('documentId') documentId: string) {
    return { documentId, viewerId: req.user.id };
  }

  @Post()
  @ApiOperation({ summary: 'Create a trip' })
  @ApiBody({ type: CreateTripBodyDto })
  async create(@Body() body: { data: any }) {
    return body.data;
  }

  @Put(':documentId')
  @ApiOperation({ summary: 'Update a trip' })
  @ApiParam({ name: 'documentId', description: 'UUID document ID of the trip' })
  @ApiBody({ type: UpdateTripBodyDto })
  async update(
    @Req() req: any,
    @Param('documentId') documentId: string,
    @Body() body: { data: any },
  ) {
    return { documentId, data: body.data, actorUserId: req.user.id };
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
  async remove(@Param('documentId') documentId: string) {
    return { documentId };
  }
}
