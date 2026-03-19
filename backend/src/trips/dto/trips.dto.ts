import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GenderPreference, TripStatus } from '@prisma/client';

export class CreateTripDto {
  @ApiPropertyOptional({ description: 'Trip description' })
  description?: string;

  @ApiProperty({ example: 'New York' })
  startingPoint: string;

  @ApiProperty({ example: 'Boston' })
  destination: string;

  @ApiProperty({ example: '2025-03-20', description: 'Date in YYYY-MM-DD format' })
  date: string;

  @ApiProperty({ example: '09:00', description: 'Time in HH:mm format' })
  time: string;

  @ApiProperty({ example: 3 })
  availableSeats: number;

  @ApiPropertyOptional({ example: 15.5 })
  pricePerSeat?: number;

  @ApiPropertyOptional({ default: false })
  isPriceCalculated?: boolean;

  @ApiPropertyOptional({ enum: GenderPreference, default: GenderPreference.both })
  genderPreference?: GenderPreference;

  @ApiProperty({ example: 1, description: 'Creator user ID' })
  creatorId: number;
}

export class CreateTripBodyDto {
  @ApiProperty({ type: CreateTripDto })
  data: CreateTripDto;
}

export class UpdateTripBodyDto {
  @ApiProperty({ type: CreateTripDto, description: 'Partial trip data to update' })
  data: Partial<CreateTripDto>;
}
