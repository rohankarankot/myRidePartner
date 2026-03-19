import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { Prisma, TripStatus, GenderPreference } from '@prisma/client';
import {
  PaginationParams,
  buildPaginationMeta,
  PaginatedMeta,
} from '../common/utils/query.utils';

export interface TripFilters {
  status?: TripStatus;
  genderPreference?: GenderPreference;
  date?: string;
  creatorId?: number;
}

@Injectable()
export class TripsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsGateway: EventsGateway,
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

    const [trips, total] = await Promise.all([
      this.prisma.trip.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: { id: true, username: true, email: true },
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
          select: { id: true, username: true, email: true },
        },
        joinRequests: {
          include: {
            passenger: {
              select: { id: true, username: true, email: true },
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

  /**
   * Get all trips created by a specific user.
   */
  async findByCreatorId(userId: number) {
    const trips = await this.prisma.trip.findMany({
      where: { creatorId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: { id: true, username: true, email: true },
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
        pricePerSeat: data.pricePerSeat,
        isPriceCalculated: data.isPriceCalculated,
        genderPreference: data.genderPreference as GenderPreference,
        creator: { connect: { id: data.creator } },
      },
      include: {
        creator: {
          select: { id: true, username: true, email: true },
        },
      },
    });

    return { data: trip };
  }

  /**
   * Update a trip by documentId (general update).
   */
  async update(documentId: string, data: Prisma.TripUpdateInput) {
    const trip = await this.prisma.trip.update({
      where: { documentId },
      data,
      include: {
        creator: {
          select: { id: true, username: true, email: true },
        },
      },
    });

    this.eventsGateway.emitToTripRoom(documentId, 'trip_updated', {
      documentId,
    });

    return { data: trip };
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
