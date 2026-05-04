import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateTripChatMessageDto {
  @ApiProperty({ example: 'I am five minutes away.' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ example: 'msg_abc123' })
  @IsOptional()
  @IsString()
  replyToDocumentId?: string;
}

export class GetTripChatMessagesQueryDto {
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
