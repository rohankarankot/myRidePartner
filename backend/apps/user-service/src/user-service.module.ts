import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserServiceController } from './user-service.controller';
import { UsersService } from './users.service';
import { PrismaModule } from '@app/common';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
  ],
  controllers: [UserServiceController],
  providers: [UsersService],
})
export class UserServiceModule {}
