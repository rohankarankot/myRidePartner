import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '@prisma/client';
import { IsOptional, IsString, IsBoolean, IsEnum, IsEmail } from 'class-validator';

export class CreateUserProfileDto {
  @ApiProperty({ example: 'John Doe' })
  fullName: string;

  @ApiProperty({ example: '+1234567890' })
  phoneNumber: string;

  @ApiProperty({ enum: Gender })
  gender: Gender;

  @ApiProperty({ example: 1, description: 'Associated user ID' })
  userId: number;
}

export class UpdateUserProfileDto {
  @ApiPropertyOptional({ description: 'Full name' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'City location' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Avatar URL' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ description: 'Expo push token' })
  @IsOptional()
  @IsString()
  pushToken?: string;

  @ApiPropertyOptional({
    description: 'Whether the overall profile is verified',
  })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional({ description: 'Community consent status' })
  @IsOptional()
  @IsBoolean()
  communityConsent?: boolean;
}

export class RequestOrgVerificationDto {
  @ApiProperty({ description: 'Workspace or University Email' })
  @IsEmail()
  email: string;
}

export class ConfirmOrgVerificationDto {
  @ApiProperty({ description: 'Workspace or University Email' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: '6-digit OTP' })
  @IsString()
  otp: string;
}
