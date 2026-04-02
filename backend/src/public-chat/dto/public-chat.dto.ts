import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreatePublicChatMessageDto {
  @ApiProperty({ example: 'Anyone heading from Koramangala this evening?' })
  @IsString()
  message: string;
}

export class GetPublicChatMessagesQueryDto {
  @ApiPropertyOptional({ example: 'msg_abc123' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ example: 40, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
