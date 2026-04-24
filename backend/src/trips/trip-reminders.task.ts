import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationType, TripStatus } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  buildTripStartDateTime,
  getTodayDateString,
} from './trip-time.utils';

const REMINDER_OFFSETS_MINUTES = [30, 20, 10, 0] as const;

@Injectable()
export class TripRemindersTask {
  private readonly logger = new Logger(TripRemindersTask.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async sendUpcomingTripReminders() {
    const now = new Date();
    const today = getTodayDateString(now);
    const tomorrow = getTodayDateString(
      new Date(now.getTime() + 24 * 60 * 60 * 1000),
    );

    const trips = await this.prisma.trip.findMany({
      where: {
        status: TripStatus.PUBLISHED,
        date: { in: [today, tomorrow] },
      },
      select: {
        id: true,
        documentId: true,
        date: true,
        time: true,
        startingPoint: true,
        destination: true,
        creatorId: true,
        joinRequests: {
          where: { status: 'APPROVED' },
          select: { passengerId: true },
        },
      },
    });

    for (const trip of trips) {
      const tripStart = buildTripStartDateTime(trip.date, trip.time);
      const msUntilStart = tripStart.getTime() - now.getTime();

      if (msUntilStart < 0 || msUntilStart > 30 * 60 * 1000) {
        continue;
      }

      const reminderOffset = REMINDER_OFFSETS_MINUTES.find((offset, index) => {
        const upperBound = offset * 60 * 1000;
        const lowerBound =
          index === REMINDER_OFFSETS_MINUTES.length - 1
            ? 0
            : (REMINDER_OFFSETS_MINUTES[index + 1] ?? 0) * 60 * 1000;

        return msUntilStart <= upperBound && msUntilStart > lowerBound;
      });

      if (reminderOffset === undefined) {
        continue;
      }

      const recipientIds = [
        trip.creatorId,
        ...trip.joinRequests.map((request) => request.passengerId),
      ];

      const uniqueRecipientIds = [...new Set(recipientIds)];

      for (const userId of uniqueRecipientIds) {
        const relatedId = `trip-reminder:${trip.documentId}:${reminderOffset}:${userId}`;
        const alreadySent = await this.prisma.notification.findFirst({
          where: {
            userId,
            relatedId,
            type: NotificationType.TRIP_UPDATE,
          },
          select: { id: true },
        });

        if (alreadySent) {
          continue;
        }

        const { title, message } = this.buildReminderCopy({
          minutesRemaining: reminderOffset,
          isCaptain: userId === trip.creatorId,
          startingPoint: trip.startingPoint,
          destination: trip.destination,
        });

        await this.notificationsService.create({
          userId,
          title,
          message,
          type: NotificationType.TRIP_UPDATE,
          relatedId,
          data: {
            tripId: trip.documentId,
            reminderMinutesRemaining: reminderOffset,
            reminderKind: 'TRIP_START_REMINDER',
          },
        });
      }
    }
  }

  private buildReminderCopy(input: {
    minutesRemaining: number;
    isCaptain: boolean;
    startingPoint: string;
    destination: string;
  }) {
    const route = `${input.startingPoint} to ${input.destination}`;

    if (input.minutesRemaining === 0) {
      return {
        title: input.isCaptain ? 'Ride starts now' : 'Your ride starts now',
        message: input.isCaptain
          ? `Your ride from ${route} is scheduled to start now.`
          : `Your ride from ${route} is scheduled to start now. Be ready to join.`,
      };
    }

    return {
      title: input.isCaptain
        ? `Ride starts in ${input.minutesRemaining} min`
        : `Your ride starts in ${input.minutesRemaining} min`,
      message: input.isCaptain
        ? `Your ride from ${route} starts in ${input.minutesRemaining} minutes.`
        : `Your ride from ${route} starts in ${input.minutesRemaining} minutes. Please get ready.`,
    };
  }
}
