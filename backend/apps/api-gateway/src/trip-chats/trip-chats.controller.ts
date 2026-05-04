import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  Inject,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTripChatMessageDto, GetTripChatMessagesQueryDto } from '@app/common';

@ApiTags('Trip Chats')
@ApiBearerAuth()
@Controller('trips/:documentId/chat')
@UseGuards(JwtAuthGuard)
export class TripChatsController {
  constructor(@Inject('CHAT_SERVICE') private readonly chatClient: ClientProxy) {}

  @Get()
  @ApiOperation({ summary: 'Get trip chat access metadata' })
  @ApiParam({ name: 'documentId', description: 'Trip document ID' })
  async getChatAccess(@Param('documentId') documentId: string, @Req() req: any) {
    return firstValueFrom(this.chatClient.send({ cmd: 'getChatAccess' }, { tripDocumentId: documentId, userId: req.user.id }));
  }

  @Get('messages')
  @ApiOperation({ summary: 'Get trip chat messages' })
  @ApiParam({ name: 'documentId', description: 'Trip document ID' })
  async getMessages(
    @Param('documentId') documentId: string,
    @Req() req: any,
    @Query() query: GetTripChatMessagesQueryDto,
  ) {
    return firstValueFrom(this.chatClient.send({ cmd: 'getMessages' }, { tripDocumentId: documentId, userId: req.user.id, query }));
  }

  @Post('messages')
  @ApiOperation({ summary: 'Send a trip chat message' })
  @ApiParam({ name: 'documentId', description: 'Trip document ID' })
  @ApiBody({ type: CreateTripChatMessageDto })
  async createMessage(
    @Param('documentId') documentId: string,
    @Req() req: any,
    @Body() body: CreateTripChatMessageDto,
  ) {
    return firstValueFrom(this.chatClient.send({ cmd: 'createMessage' }, { tripDocumentId: documentId, userId: req.user.id, body }));
  }
}
