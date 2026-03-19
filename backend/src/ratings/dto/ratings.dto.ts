import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRatingDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  stars: number;

  @ApiPropertyOptional({ description: 'Optional comment' })
  comment?: string;

  @ApiProperty({ description: 'Trip document ID' })
  trip: string;

  @ApiProperty({ example: 1, description: 'Rater user ID' })
  rater: number;

  @ApiProperty({ example: 2, description: 'Ratee user ID' })
  ratee: number;
}
