import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JoinRequestStatus } from '@prisma/client';

@Injectable()
export class JoinRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all join requests for a specific trip.
   */
  async findByTrip(tripDocumentId: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { documentId: tripDocumentId },
      select: { id: true },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    const requests = await this.prisma.joinRequest.findMany({
      where: { tripId: trip.id },
      orderBy: { createdAt: 'desc' },
      include: {
        passenger: {
          select: { id: true, username: true, email: true },
        },
        trip: {
          include: {
            creator: {
              select: { id: true, username: true, email: true },
            },
          },
        },
      },
    });

    return requests;
  }

  /**
   * Get pending requests where the user is the trip creator (captain).
   */
  async findPendingForCaptain(captainId: number) {
    const requests = await this.prisma.joinRequest.findMany({
      where: {
        status: 'PENDING',
        trip: { creatorId: captainId },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        passenger: {
          select: { id: true, username: true, email: true },
        },
        trip: {
          include: {
            creator: {
              select: { id: true, username: true, email: true },
            },
          },
        },
      },
    });

    return requests;
  }

  /**
   * Get a single join request by its documentId.
   */
  async findByDocumentId(documentId: string) {
    const request = await this.prisma.joinRequest.findUnique({
      where: { documentId },
      include: {
        passenger: {
          select: { id: true, username: true, email: true },
        },
        trip: {
          include: {
            creator: {
              select: { id: true, username: true, email: true },
            },
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Join request not found');
    }

    return request;
  }

  /**
   * Create a new join request.
   */
  async create(data: {
    trip: string; // trip documentId
    passenger: number; // passenger userId
    requestedSeats: number;
    message?: string;
  }) {
    const trip = await this.prisma.trip.findUnique({
      where: { documentId: data.trip },
      select: { id: true },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    const request = await this.prisma.joinRequest.create({
      data: {
        requestedSeats: data.requestedSeats,
        message: data.message,
        trip: { connect: { id: trip.id } },
        passenger: { connect: { id: data.passenger } },
      },
      include: {
        passenger: {
          select: { id: true, username: true, email: true },
        },
        trip: {
          include: {
            creator: {
              select: { id: true, username: true, email: true },
            },
          },
        },
      },
    });

    return request;
  }

  /**
   * Update a join request's status (APPROVED / REJECTED / CANCELLED).
   * When approved, decrement the trip's available seats.
   */
  async updateStatus(documentId: string, status: JoinRequestStatus) {
    const existing = await this.prisma.joinRequest.findUnique({
      where: { documentId },
      select: { id: true, requestedSeats: true, tripId: true },
    });

    if (!existing) {
      throw new NotFoundException('Join request not found');
    }

    // If approving, decrement available seats
    if (status === 'APPROVED') {
      await this.prisma.trip.update({
        where: { id: existing.tripId },
        data: { availableSeats: { decrement: existing.requestedSeats } },
      });
    }

    const request = await this.prisma.joinRequest.update({
      where: { documentId },
      data: { status },
      include: {
        passenger: {
          select: { id: true, username: true, email: true },
        },
        trip: {
          include: {
            creator: {
              select: { id: true, username: true, email: true },
            },
          },
        },
      },
    });

    return request;
  }
}
