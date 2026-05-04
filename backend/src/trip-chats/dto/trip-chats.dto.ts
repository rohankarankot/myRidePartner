export class CreateTripChatMessageDto {
  message!: string;
  replyToDocumentId?: string;
}

export class GetTripChatMessagesQueryDto {
  limit?: number;
  cursor?: string;
}
