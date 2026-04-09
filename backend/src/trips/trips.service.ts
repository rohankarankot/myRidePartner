import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { Prisma, TripStatus, GenderPreference, NotificationType } from '@prisma/client';
import {
  PaginationParams,
  buildPaginationMeta,
  PaginatedMeta,
} from '../common/utils/query.utils';
import { TripChatsService } from '../trip-chats/trip-chats.service';

export interface TripFilters {
  status?: TripStatus;
  genderPreference?: GenderPreference;
  date?: string;
  creatorId?: number;
  city?: string;
  fromQuery?: string;
  toQuery?: string;
  viewerId?: number;
}

@Injectable()
export class TripsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsGateway: EventsGateway,
    private readonly notificationsService: NotificationsService,
    private readonly tripChatsService: TripChatsService,
  ) {}

  /**
   * Paginated list of trips with optional filters.
   */
  async findAll(
    pagination: PaginationParams,
    filters: TripFilters = {},
  ): Promise<{ data: any[]; meta: PaginatedMeta }> {
    const where: Prisma.TripWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.genderPreference) {
      where.genderPreference = filters.genderPreference;
    }
    if (filters.date) {
      where.date = filters.date;
    }
    if (filters.creatorId) {
      where.creatorId = filters.creatorId;
    }
    if (filters.city) {
      where.city = filters.city;
    }
    if (filters.fromQuery) {
      where.startingPoint = {
        contains: filters.fromQuery,
        mode: 'insensitive',
      };
    }
    if (filters.toQuery) {
      where.destination = {
        contains: filters.toQuery,
        mode: 'insensitive',
      };
    }
    if (filters.viewerId) {
      where.creator = {
        blockedUsers: {
          none: {
            blockedUserId: filters.viewerId,
          },
        },
        blockedByUsers: {
          none: {
            blockerId: filters.viewerId,
          },
        },
      };
    }

    const [trips, total] = await Promise.all([
      this.prisma.trip.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              email: true,
              userProfile: {
                select: { avatar: true },
              },
            },
          },
        },
      }),
      this.prisma.trip.count({ where }),
    ]);

    return {
      data: trips,
      meta: buildPaginationMeta(total, pagination),
    };
  }

  /**
   * Find a single trip by its documentId (UUID).
   */
  async findByDocumentId(documentId: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { documentId },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
            userProfile: {
              select: { avatar: true },
            },
          },
        },
        joinRequests: {
          include: {
            passenger: {
              select: {
                id: true,
                username: true,
                email: true,
                userProfile: {
                  select: {
                    fullName: true,
                    phoneNumber: true,
                    avatar: true,
                    city: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!trip) {
      throw new NotFoundException(`Trip not found`);
    }

    return { data: trip };
  }

  async findAccessibleByDocumentId(documentId: string, viewerId: number) {
    const trip = await this.prisma.trip.findFirst({
      where: {
        documentId,
        creator: {
          blockedUsers: {
            none: {
              blockedUserId: viewerId,
            },
          },
          blockedByUsers: {
            none: {
              blockerId: viewerId,
            },
          },
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
            userProfile: {
              select: { avatar: true },
            },
          },
        },
        joinRequests: {
          include: {
            passenger: {
              select: {
                id: true,
                username: true,
                email: true,
                userProfile: {
                  select: {
                    fullName: true,
                    phoneNumber: true,
                    avatar: true,
                    city: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!trip) {
      throw new NotFoundException(`Trip not found`);
    }

    return { data: trip };
  }

  async findPublicByDocumentId(documentId: string) {
    const trip = await this.prisma.trip.findFirst({
      where: {
        documentId,
        status: {
          in: [TripStatus.PUBLISHED, TripStatus.STARTED],
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            userProfile: {
              select: {
                fullName: true,
                avatar: true,
                city: true,
                rating: true,
                ratingsCount: true,
                completedTripsCount: true,
                governmentIdVerified: true,
              },
            },
          },
        },
        joinRequests: {
          select: {
            status: true,
            requestedSeats: true,
          },
        },
      },
    });

    if (!trip) {
      throw new NotFoundException(`Trip not found`);
    }

    const approvedRequests = trip.joinRequests.filter((request) => request.status === 'APPROVED');
    const seatsBooked = approvedRequests.reduce((sum, request) => sum + request.requestedSeats, 0);

    return {
      data: {
        documentId: trip.documentId,
        description: trip.description,
        startingPoint: trip.startingPoint,
        destination: trip.destination,
        date: trip.date,
        time: trip.time,
        city: trip.city,
        availableSeats: trip.availableSeats,
        seatsBooked,
        seatsRemaining: Math.max(trip.availableSeats - seatsBooked, 0),
        pricePerSeat: trip.pricePerSeat,
        isPriceCalculated: trip.isPriceCalculated,
        genderPreference: trip.genderPreference,
        status: trip.status,
        createdAt: trip.createdAt,
        creator: {
          id: trip.creator.id,
          username: trip.creator.username,
          fullName: trip.creator.userProfile?.fullName ?? null,
          avatar: trip.creator.userProfile?.avatar ?? null,
          city: trip.creator.userProfile?.city ?? null,
          rating: trip.creator.userProfile?.rating ?? null,
          ratingsCount: trip.creator.userProfile?.ratingsCount ?? 0,
          completedTripsCount: trip.creator.userProfile?.completedTripsCount ?? 0,
          governmentIdVerified: trip.creator.userProfile?.governmentIdVerified ?? false,
        },
      },
    };
  }

  /**
   * Get all trips created by a specific user.
   */
  async findByCreatorId(userId: number, viewerId?: number) {
    const where: Prisma.TripWhereInput = { creatorId: userId };

    if (viewerId && viewerId !== userId) {
      where.creator = {
        blockedUsers: {
          none: {
            blockedUserId: viewerId,
          },
        },
        blockedByUsers: {
          none: {
            blockerId: viewerId,
          },
        },
      };
    }

    const trips = await this.prisma.trip.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
            userProfile: {
              select: { avatar: true },
            },
          },
        },
        joinRequests: {
          select: { status: true },
        },
      },
    });

    return { data: trips };
  }

  /**
   * Create a new trip.
   */
  async create(data: {
    description?: string;
    startingPoint: string;
    destination: string;
    date: string;
    time: string;
    availableSeats: number;
    city?: string;
    pricePerSeat?: number;
    isPriceCalculated: boolean;
    genderPreference: string;
    creator: number;
  }) {
    const trip = await this.prisma.trip.create({
      data: {
        description: data.description,
        startingPoint: data.startingPoint,
        destination: data.destination,
        date: data.date,
        time: data.time,
        availableSeats: data.availableSeats,
        city: data.city,
        pricePerSeat: data.pricePerSeat,
        isPriceCalculated: data.isPriceCalculated,
        genderPreference: data.genderPreference as GenderPreference,
        creator: { connect: { id: data.creator } },
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
            userProfile: {
              select: { avatar: true },
            },
          },
        },
      },
    });

    return { data: trip };
  }

  /**
   * Update a trip by documentId (general update).
   */
  async update(documentId: string, data: Prisma.TripUpdateInput) {
    // 1. Get the current trip to identify change
    const oldTrip = await this.prisma.trip.findUnique({
      where: { documentId },
      select: {
        status: true,
        startingPoint: true,
        destination: true,
        isPriceCalculated: true,
        pricePerSeat: true,
      },
    });

    if (!oldTrip) {
      throw new NotFoundException(`Trip not found`);
    }

    if (
      data.status === 'COMPLETED' &&
      oldTrip.isPriceCalculated &&
      oldTrip.pricePerSeat == null &&
      data.pricePerSeat == null
    ) {
      throw new BadRequestException(
        'Price per seat is required before completing a trip with calculated pricing.',
      );
    }

    // 2. Perform the update
    const trip = await this.prisma.trip.update({
      where: { documentId },
      data,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
            userProfile: {
              select: { avatar: true },
            },
          },
        },
      },
    });

    // 3. Emit real-time event through socket trip room
    this.eventsGateway.emitToTripRoom(documentId, 'trip_updated', {
      documentId,
      status: trip.status,
    });

    // 4. Send notifications to all approved passengers if status changed
    if (data.status && data.status !== oldTrip.status) {
      this.notifyPassengersOfStatusChange(trip);

      // 5. Increment completed trips count if status is COMPLETED
      if (data.status === 'COMPLETED') {
        this.incrementCompletedTripsStats(trip);
        await this.tripChatsService.deleteChatForCompletedTrip(documentId);
      }
    }

    return { data: trip };
  }

  /**
   * Helper to increment completedTripsCount for creator and passengers.
   */
  private async incrementCompletedTripsStats(trip: any) {
    // 1. Increment for creator (Captain)
    await this.prisma.userProfile.update({
      where: { userId: trip.creatorId },
      data: { completedTripsCount: { increment: 1 } },
    });

    // 2. Increment for approved passengers
    const passengers = await this.prisma.joinRequest.findMany({
      where: {
        tripId: trip.id,
        status: 'APPROVED',
      },
      select: {
        passengerId: true,
      },
    });

    for (const p of passengers) {
      await this.prisma.userProfile.update({
        where: { userId: p.passengerId },
        data: { completedTripsCount: { increment: 1 } },
      });
    }
  }

  /**
   * Helper to notify all approved passengers of a trip status change.
   */
  private async notifyPassengersOfStatusChange(trip: any) {
    const passengers = await this.prisma.joinRequest.findMany({
      where: {
        tripId: trip.id,
        status: 'APPROVED',
      },
      select: {
        passengerId: true,
      },
    });

    const statusLabels: Record<string, string> = {
      STARTED: 'started',
      COMPLETED: 'completed',
      CANCELLED: 'cancelled',
    };

    const label = statusLabels[trip.status] || trip.status.toLowerCase();

    for (const p of passengers) {
      await this.notificationsService.create({
        userId: p.passengerId,
        title: `Trip ${label}`,
        message: `The trip from ${trip.startingPoint} to ${trip.destination} has been ${label}.`,
        type: trip.status === 'COMPLETED' ? NotificationType.TRIP_COMPLETED : NotificationType.TRIP_UPDATE,
        relatedId: trip.documentId,
        data: { tripId: trip.documentId },
      });
    }
  }

  /**
   * Delete a trip by documentId.
   */
  async delete(documentId: string) {
    const trip = await this.prisma.trip.delete({
      where: { documentId },
    });

    return { data: trip };
  }
}
