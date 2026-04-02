import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PublicChatService } from './public-chat.service';
import {
  CreatePublicChatMessageDto,
  GetPublicChatMessagesQueryDto,
} from './dto/public-chat.dto';

@ApiTags('Public Chat')
@ApiBearerAuth()
@Controller('public-chat')
@UseGuards(JwtAuthGuard)
export class PublicChatController {
  constructor(private readonly publicChatService: PublicChatService) {}

  @Get('messages')
  @ApiOperation({ summary: 'Get public community chat messages' })
  getMessages(@Req() req: any, @Query() query: GetPublicChatMessagesQueryDto) {
    return this.publicChatService.getMessages(req.user.id, query);
  }

  @Post('messages')
  @ApiOperation({ summary: 'Send a public community chat message' })
  @ApiBody({ type: CreatePublicChatMessageDto })
  createMessage(@Req() req: any, @Body() body: CreatePublicChatMessageDto) {
    return this.publicChatService.createMessage(req.user.id, body);
  }
}
