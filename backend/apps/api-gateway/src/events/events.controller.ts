import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EventsGateway } from './events.gateway';

@Controller()
export class EventsController {
  constructor(private readonly eventsGateway: EventsGateway) {}

  @MessagePattern({ cmd: 'emitToUser' })
  async emitToUser(@Payload() payload: { userId: number; event: string; data: any }) {
    this.eventsGateway.emitToUser(payload.userId, payload.event, payload.data);
    return { success: true };
  }

  @MessagePattern({ cmd: 'emitToTripRoom' })
  async emitToTripRoom(@Payload() payload: { tripDocumentId: string; event: string; data: any }) {
    this.eventsGateway.emitToTripRoom(payload.tripDocumentId, payload.event, payload.data);
    return { success: true };
  }

  @MessagePattern({ cmd: 'emitToChatRoom' })
  async emitToChatRoom(@Payload() payload: { tripDocumentId: string; event: string; data: any }) {
    this.eventsGateway.emitToChatRoom(payload.tripDocumentId, payload.event, payload.data);
    return { success: true };
  }

  @MessagePattern({ cmd: 'emitToGroupChatRoom' })
  async emitToGroupChatRoom(@Payload() payload: { groupId: string; event: string; data: any }) {
    this.eventsGateway.emitToGroupChatRoom(payload.groupId, payload.event, payload.data);
    return { success: true };
  }

  @MessagePattern({ cmd: 'emitToPublicChatRoom' })
  async emitToPublicChatRoom(@Payload() payload: { city: string; event: string; data: any }) {
    this.eventsGateway.emitToPublicChatRoom(payload.city, payload.event, payload.data);
    return { success: true };
  }

  @MessagePattern({ cmd: 'isUserActivelyViewingChat' })
  async isUserActivelyViewingChat(@Payload() payload: { tripDocumentId: string; userId: number }) {
    return this.eventsGateway.isUserActivelyViewingChat(payload.tripDocumentId, payload.userId);
  }
}
