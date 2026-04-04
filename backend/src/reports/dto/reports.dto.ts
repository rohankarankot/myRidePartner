import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportReason, ReportSource, ReportTargetType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateReportDto {
  @ApiProperty({ enum: ReportReason, description: 'Reason for reporting' })
  @IsEnum(ReportReason)
  reason: ReportReason;

  @ApiPropertyOptional({ description: 'Additional details about the report' })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Details must be at most 500 characters.' })
  details?: string;

  @ApiProperty({ enum: ReportSource, description: 'Source of the report (trip or profile)' })
  @IsEnum(ReportSource)
  source: ReportSource;

  @ApiPropertyOptional({ enum: ReportTargetType, description: 'Whether the report targets a user or a specific message' })
  @IsOptional()
  @IsEnum(ReportTargetType)
  targetType?: ReportTargetType;

  @ApiProperty({ description: 'ID of the reported user' })
  @Type(() => Number)
  @IsInt()
  reportedUserId: number;

  @ApiPropertyOptional({ description: 'Optional trip document ID if the report is related to a trip' })
  @IsOptional()
  @IsString()
  tripDocumentId?: string;

  @ApiPropertyOptional({ description: 'Optional reported message document ID for message reports' })
  @IsOptional()
  @IsString()
  messageDocumentId?: string;

  @ApiPropertyOptional({ description: 'Optional short preview of the reported message' })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Message preview must be at most 500 characters.' })
  messagePreview?: string;
}
