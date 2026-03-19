import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { RatingsService } from './ratings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateRatingDto } from './dto/ratings.dto';

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
