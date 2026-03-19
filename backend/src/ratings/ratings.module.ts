import { Module } from '@nestjs/common';
import { RatingsController } from './ratings.controller';
import { RatingsService } from './ratings.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [RatingsController],
  providers: [RatingsService, PrismaService],
  exports: [RatingsService],
})
export class RatingsModule {}
