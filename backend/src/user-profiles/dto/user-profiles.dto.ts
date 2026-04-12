import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '@prisma/client';

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
  @ApiPropertyOptional({ example: 'John Doe' })
  fullName?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'Avatar URL' })
  avatar?: string;

  @ApiPropertyOptional({ description: 'Uploaded government ID document URL' })
  governmentIdDocument?: string;

  @ApiPropertyOptional({ description: 'Extracted Aadhaar number' })
  aadhaarNumber?: string;

  @ApiPropertyOptional({ enum: Gender })
  gender?: Gender;

  @ApiPropertyOptional({ description: 'Push notification token' })
  pushToken?: string;

  @ApiPropertyOptional({ description: 'Whether the government ID has been verified' })
  governmentIdVerified?: boolean;

  @ApiPropertyOptional({ description: 'Whether the overall profile is verified' })
  isVerified?: boolean;

  @ApiPropertyOptional({ description: 'Whether the user consented to join the community' })
  communityConsent?: boolean;
}
