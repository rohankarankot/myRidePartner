import { ApiPropertyOptional } from '@nestjs/swagger';
import { ReportReviewStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { AdminListQueryDto } from './admin-list-query.dto';

export class AdminReportsQueryDto extends AdminListQueryDto {
  @ApiPropertyOptional({ enum: ReportReviewStatus })
  @IsOptional()
  @IsEnum(ReportReviewStatus)
  status?: ReportReviewStatus;
}
