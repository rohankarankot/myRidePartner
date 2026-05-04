import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportReviewStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateReportReviewDto {
  @ApiProperty({ enum: ReportReviewStatus })
  @IsEnum(ReportReviewStatus)
  reviewStatus: ReportReviewStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  reviewNotes?: string;
}
