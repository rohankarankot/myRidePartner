import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TripChatsService } from './trip-chats.service';
import { CreateTripChatMessageDto, GetTripChatMessagesQueryDto } from '@app/common';

@Controller()
export class TripChatsController {
  constructor(private readonly tripChatsService: TripChatsService) {}

  @MessagePattern({ cmd: 'getChatAccess' })
  async getChatAccess(@Payload() payload: { tripDocumentId: string; userId: number }) {
    return this.tripChatsService.getChatAccess(payload.tripDocumentId, payload.userId);
  }

  @MessagePattern({ cmd: 'getMessages' })
  async getMessages(@Payload() payload: { tripDocumentId: string; userId: number; query?: GetTripChatMessagesQueryDto }) {
    return this.tripChatsService.getMessages(payload.tripDocumentId, payload.userId, payload.query);
  }

  @MessagePattern({ cmd: 'createMessage' })
  async createMessage(@Payload() payload: { tripDocumentId: string; userId: number; body: CreateTripChatMessageDto }) {
    return this.tripChatsService.createMessage(payload.tripDocumentId, payload.userId, payload.body);
  }

  @MessagePattern({ cmd: 'deleteChatForCompletedTrip' })
  async deleteChatForCompletedTrip(@Payload() payload: { tripDocumentId: string }) {
    return this.tripChatsService.deleteChatForCompletedTrip(payload.tripDocumentId);
  }

  @MessagePattern({ cmd: 'canJoinSocketRoom' })
  async canJoinSocketRoom(@Payload() payload: { tripDocumentId: string; userId: number }) {
    return this.tripChatsService.canJoinSocketRoom(payload.tripDocumentId, payload.userId);
  }
}
