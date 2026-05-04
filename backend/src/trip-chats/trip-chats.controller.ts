import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTripChatMessageDto, GetTripChatMessagesQueryDto } from '@app/common';

@ApiTags('Trip Chats')
@ApiBearerAuth()
@Controller('trips/:documentId/chat')
@UseGuards(JwtAuthGuard)
export class TripChatsController {
  @Get()
  @ApiOperation({ summary: 'Get trip chat access metadata' })
  @ApiParam({ name: 'documentId', description: 'Trip document ID' })
  async getChatAccess(@Param('documentId') documentId: string, @Req() req: any) {
    return { tripDocumentId: documentId, userId: req.user.id };
  }

  @Get('messages')
  @ApiOperation({ summary: 'Get trip chat messages' })
  @ApiParam({ name: 'documentId', description: 'Trip document ID' })
  async getMessages(
    @Param('documentId') documentId: string,
    @Req() req: any,
    @Query() query: GetTripChatMessagesQueryDto,
  ) {
    return { tripDocumentId: documentId, userId: req.user.id, query };
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
    return { tripDocumentId: documentId, userId: req.user.id, body };
  }
}
