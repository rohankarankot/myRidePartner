import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { SentryModule } from '@sentry/nestjs/setup';
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
import { ScheduleModule } from '@nestjs/schedule';
import { TripChatsModule } from './trip-chats/trip-chats.module';
import { ReportsModule } from './reports/reports.module';
import { PublicChatModule } from './public-chat/public-chat.module';
import { CommunityGroupsModule } from './community-groups/community-groups.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SentryModule.forRoot(),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { singleLine: true, colorize: true } }
            : undefined,
      },
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    ScheduleModule.forRoot(),
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
    TripChatsModule,
    PublicChatModule,
    ReportsModule,
    CommunityGroupsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
