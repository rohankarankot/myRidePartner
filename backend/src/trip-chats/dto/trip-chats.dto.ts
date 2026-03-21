import { ApiProperty } from '@nestjs/swagger';

export class CreateTripChatMessageDto {
  @ApiProperty({ example: 'I am five minutes away.' })
  message: string;
}
