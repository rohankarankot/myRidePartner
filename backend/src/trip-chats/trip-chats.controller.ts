import {
  Body,
  Controller,
  Get,
  Param,
  Post,
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
import { TripChatsService } from './trip-chats.service';
import { CreateTripChatMessageDto } from './dto/trip-chats.dto';

@ApiTags('Trip Chats')
@ApiBearerAuth()
@Controller('trips/:documentId/chat')
@UseGuards(JwtAuthGuard)
export class TripChatsController {
  constructor(private readonly tripChatsService: TripChatsService) {}

  @Get()
  @ApiOperation({ summary: 'Get trip chat access metadata' })
  @ApiParam({ name: 'documentId', description: 'Trip document ID' })
  getChatAccess(@Param('documentId') documentId: string, @Req() req: any) {
    return this.tripChatsService.getChatAccess(documentId, req.user.id);
  }

  @Get('messages')
  @ApiOperation({ summary: 'Get trip chat messages' })
  @ApiParam({ name: 'documentId', description: 'Trip document ID' })
  getMessages(@Param('documentId') documentId: string, @Req() req: any) {
    return this.tripChatsService.getMessages(documentId, req.user.id);
  }

  @Post('messages')
  @ApiOperation({ summary: 'Send a trip chat message' })
  @ApiParam({ name: 'documentId', description: 'Trip document ID' })
  @ApiBody({ type: CreateTripChatMessageDto })
  createMessage(
    @Param('documentId') documentId: string,
    @Req() req: any,
    @Body() body: CreateTripChatMessageDto,
  ) {
    return this.tripChatsService.createMessage(documentId, req.user.id, body.message);
  }
}
