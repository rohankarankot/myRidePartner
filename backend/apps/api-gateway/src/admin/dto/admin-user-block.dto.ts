import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class AdminUserBlockDto {
  @ApiProperty()
  @IsBoolean()
  blocked: boolean;
}
