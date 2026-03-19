import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { RatingsService } from './ratings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateRatingDto } from './dto/ratings.dto';
import { parsePagination } from '../common/utils/query.utils';

@ApiTags('Ratings')
@ApiBearerAuth()
@Controller('ratings')
@UseGuards(JwtAuthGuard)
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a rating', description: 'Rate a user for a specific trip' })
  @ApiBody({ type: CreateRatingDto })
  create(
    @Body() body: {
      stars: number;
      comment?: string;
      trip: string;
      rater: number;
      ratee: number;
    },
  ) {
    return this.ratingsService.create(body);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all ratings for a user', description: 'Returns paginated ratings received by a user' })
  @ApiParam({ name: 'userId', example: 1 })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 10 })
  getRatingsByUser(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const pagination = parsePagination({ page, pageSize });
    return this.ratingsService.getRatingsByUser(parseInt(userId, 10), pagination);
  }

  @Get('trip/:tripDocumentId/user/:userId')
  @ApiOperation({ summary: 'Get rating for a trip by user', description: 'Check if a user has already rated for a specific trip' })
  @ApiParam({ name: 'tripDocumentId', description: 'Trip document ID' })
  @ApiParam({ name: 'userId', example: 1 })
  getRatingForTripByUser(
    @Param('tripDocumentId') tripDocumentId: string,
    @Param('userId') userId: string,
  ) {
    return this.ratingsService.getRatingForTripByUser(
      tripDocumentId,
      parseInt(userId, 10),
    );
  }
}
