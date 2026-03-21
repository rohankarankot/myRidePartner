import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTripChatMessageDto {
  @ApiProperty({ example: 'I am five minutes away.' })
  message: string;
}

export class GetTripChatMessagesQueryDto {
  @ApiPropertyOptional({ example: 'msg_abc123' })
  cursor?: string;

  @ApiPropertyOptional({ example: 40, minimum: 1, maximum: 100 })
  limit?: number;
}
