import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { UserProfilesModule } from './user-profiles/user-profiles.module';
import { UploadModule } from './upload/upload.module';
import { TripsModule } from './trips/trips.module';
import { JoinRequestsModule } from './join-requests/join-requests.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RatingsModule } from './ratings/ratings.module';
import { EventsModule } from './events/events.module';
import { PrismaModule } from './prisma.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    AuthModule,
    UserProfilesModule,
    UploadModule,
    TripsModule,
    JoinRequestsModule,
    NotificationsModule,
    RatingsModule,
    EventsModule,
    PrismaModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


