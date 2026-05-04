import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateJoinRequestDto {
  @ApiProperty({ description: 'Trip document ID' })
  @IsString()
  trip: string;

  @ApiProperty({ example: 1, description: 'Passenger user ID' })
  @IsInt()
  passenger: number;

  @ApiProperty({ example: 1, description: 'Number of seats requested' })
  @IsInt()
  @Min(1)
  requestedSeats: number;

  @ApiPropertyOptional({ description: 'Optional message to the captain' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({
    example: false,
    description: 'Whether the passenger allows their phone number to be shown to the captain and other approved riders in this trip',
  })
  @IsBoolean()
  sharePhoneNumber: boolean;
}

export class UpdateJoinRequestStatusDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED', 'CANCELLED'], description: 'New status' })
  @IsIn(['APPROVED', 'REJECTED', 'CANCELLED'])
  status: string;
}

export class UpdateJoinRequestPickupStatusDto {
  @ApiProperty({
    example: true,
    description: 'Whether the approved passenger has reached the pickup point',
  })
  @IsBoolean()
  hasArrived: boolean;
}
