import { Module } from '@nestjs/common';
import { UserServiceController } from './user-service.controller';
import { UsersService } from './users.service';
import { PrismaModule } from '@app/common';

@Module({
  imports: [PrismaModule],
  controllers: [UserServiceController],
  providers: [UsersService],
})
export class UserServiceModule {}
