import { Module } from '@nestjs/common';
import { PublicChatController } from './public-chat.controller';
import { PublicChatService } from './public-chat.service';
import { PrismaService } from '@app/common';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [EventsModule],
  controllers: [PublicChatController],
  providers: [PublicChatService, PrismaService],
})
export class PublicChatModule {}
