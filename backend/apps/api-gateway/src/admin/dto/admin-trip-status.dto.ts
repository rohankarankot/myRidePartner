import { ApiProperty } from '@nestjs/swagger';
import { TripStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class AdminTripStatusDto {
  @ApiProperty({ enum: TripStatus })
  @IsEnum(TripStatus)
  status: TripStatus;
}
