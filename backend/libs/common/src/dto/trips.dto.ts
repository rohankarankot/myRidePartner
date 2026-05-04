import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GenderPreference, TripStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  Validate,
  ValidateNested,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isTodayDate', async: false })
class IsTodayDateConstraint implements ValidatorConstraintInterface {
  validate(value?: string) {
    if (!value) return false;

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return value === `${year}-${month}-${day}`;
  }

  defaultMessage() {
    return 'Date must be today.';
  }
}

@ValidatorConstraint({ name: 'isFutureTodayTime', async: false })
class IsFutureTodayTimeConstraint implements ValidatorConstraintInterface {
  validate(value?: string, validationArguments?: ValidationArguments) {
    const tripData = validationArguments?.object as CreateTripDto | undefined;
    if (!value || !tripData?.date) return false;

    const match = /^(\d{1,2}):(\d{2})\s?(AM|PM)$/i.exec(value.trim());
    if (!match) return false;

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const meridiem = match[3].toUpperCase();

    if (minutes > 59 || hours < 1 || hours > 12) {
      return false;
    }

    if (meridiem === 'PM' && hours !== 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;

    const now = new Date();
    const selected = new Date(now);
    selected.setHours(hours, minutes, 0, 0);

    return selected.getTime() > now.getTime();
  }

  defaultMessage() {
    return 'Time must be in the future.';
  }
}

export class CreateTripDto {
  @ApiPropertyOptional({ description: 'Trip description' })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Trip description must be at most 200 characters.' })
  description?: string;

  @ApiProperty({ example: 'New York' })
  @IsString()
  @MaxLength(20, { message: 'Starting point must be at most 20 characters.' })
  startingPoint: string;

  @ApiProperty({ example: 'Boston' })
  @IsString()
  @MaxLength(20, { message: 'Destination must be at most 20 characters.' })
  destination: string;

  @ApiProperty({ example: '2025-03-20', description: 'Date in YYYY-MM-DD format' })
  @IsDateString({}, { message: 'Date must be a valid date.' })
  @Validate(IsTodayDateConstraint)
  date: string;

  @ApiProperty({ example: '09:00', description: 'Time in HH:mm format' })
  @IsString()
  @Validate(IsFutureTodayTimeConstraint)
  time: string;

  @ApiProperty({ example: 3 })
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Available seats must be at least 1.' })
  @Max(4, { message: 'Available seats cannot be more than 4.' })
  availableSeats: number;

  @ApiPropertyOptional({ example: 'Pune' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 15.5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Price per seat cannot be negative.' })
  @Max(1000, { message: 'Price per seat must be at most 1000.' })
  pricePerSeat?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPriceCalculated?: boolean;

  @ApiPropertyOptional({ enum: GenderPreference, default: GenderPreference.both })
  @IsOptional()
  @IsEnum(GenderPreference)
  genderPreference?: GenderPreference;

  @ApiProperty({ example: 1, description: 'Creator user ID' })
  @Type(() => Number)
  @IsInt()
  creator: number;
}

export class CreateTripBodyDto {
  @ApiProperty({ type: CreateTripDto })
  @ValidateNested()
  @Type(() => CreateTripDto)
  data: CreateTripDto;
}

export class UpdateTripBodyDto {
  @ApiProperty({ type: CreateTripDto, description: 'Partial trip data to update' })
  data: Partial<CreateTripDto>;
}
