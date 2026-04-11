import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { AdminListQueryDto } from './admin-list-query.dto';

export class AdminNotificationsQueryDto extends AdminListQueryDto {
  @ApiPropertyOptional({ description: 'Filter by recipient user id' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  userId?: number;
}
