import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EventsGateway } from '../events/events.gateway';
import { PrismaService } from '../prisma.service';
import { JoinRequestStatus, NotificationType } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class JoinRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsGateway: EventsGateway,
    private readonly notificationsService: NotificationsService,
  ) {}

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
   * Get all join requests made by a specific passenger.
   */
  async findByPassenger(passengerId: number) {
    const requests = await this.prisma.joinRequest.findMany({
      where: { passengerId },
      orderBy: { createdAt: 'desc' },
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
        trip: {
          include: {
            creator: {
              select: {
                id: true,
                username: true,
                email: true,
                userProfile: { select: { fullName: true, avatar: true } },
              },
            },
            joinRequests: {
              select: { status: true },
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
    sharePhoneNumber: boolean;
  }) {
    const trip = await this.prisma.trip.findUnique({
      where: { documentId: data.trip },
      select: { id: true, creatorId: true },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    const isBlocked = await this.prisma.userBlock.findFirst({
      where: {
        OR: [
          {
            blockerId: data.passenger,
            blockedUserId: trip.creatorId,
          },
          {
            blockerId: trip.creatorId,
            blockedUserId: data.passenger,
          },
        ],
      },
      select: { id: true },
    });

    if (isBlocked) {
      throw new ForbiddenException('You cannot interact with this trip because one of the users is blocked');
    }

    const request = await this.prisma.joinRequest.create({
      data: {
        requestedSeats: data.requestedSeats,
        message: data.message,
        sharePhoneNumber: data.sharePhoneNumber,
        trip: { connect: { id: trip.id } },
        passenger: { connect: { id: data.passenger } },
      },
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
        trip: {
          include: {
            creator: {
              select: { id: true, username: true, email: true },
            },
          },
        },
      },
    });

    // Notify trip captain (real-time + DB)
    const captainId = request.trip.creatorId;
    this.eventsGateway.emitToUser(captainId, 'join_request_created', {
      tripId: data.trip,
    });
    
    await this.notificationsService.create({
      title: 'New Join Request',
      message: `${request.passenger.username} wants to join your trip!`,
      type: NotificationType.JOIN_REQUEST,
      userId: captainId,
      relatedId: data.trip, // tripDocumentId
      data: { tripId: data.trip },
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
        trip: {
          include: {
            creator: {
              select: { id: true, username: true, email: true },
            },
          },
        },
      },
    });

    // Notify passenger (real-time + DB)
    this.eventsGateway.emitToUser(request.passengerId, 'join_request_updated', {
      tripId: request.trip.documentId,
      status: request.status,
    });
    
    await this.notificationsService.create({
      title: 'Join Request Update',
      message: `Your request for trip to ${request.trip.destination} was ${request.status.toLowerCase()}.`,
      type: NotificationType.TRIP_UPDATE,
      userId: request.passengerId,
      relatedId: request.trip.documentId,
      data: { 
        tripId: request.trip.documentId,
        status: request.status
      },
    });

    // Update trip room
    this.eventsGateway.emitToTripRoom(request.trip.documentId, 'trip_updated', {
      documentId: request.trip.documentId,
    });

    return request;
  }
}
