import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateJoinRequestDto {
  @ApiProperty({ description: 'Trip document ID' })
  trip: string;

  @ApiProperty({ example: 1, description: 'Passenger user ID' })
  passenger: number;

  @ApiProperty({ example: 1, description: 'Number of seats requested' })
  requestedSeats: number;

  @ApiPropertyOptional({ description: 'Optional message to the captain' })
  message?: string;
}

export class UpdateJoinRequestStatusDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED', 'CANCELLED'], description: 'New status' })
  status: string;
}
