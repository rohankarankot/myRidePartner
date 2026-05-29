import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTripChatMessageDto {
  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsOptional()
  @IsString()
  replyToDocumentId?: string;
}

export class GetTripChatMessagesQueryDto {
  @IsOptional()
  limit?: number;

  @IsOptional()
  @IsString()
  cursor?: string;
}
