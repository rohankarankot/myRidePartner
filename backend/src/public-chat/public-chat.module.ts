import { Module } from '@nestjs/common';
import { PublicChatController } from './public-chat.controller';
import { PublicChatService } from './public-chat.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [PublicChatController],
  providers: [PublicChatService, PrismaService],
})
export class PublicChatModule {}
