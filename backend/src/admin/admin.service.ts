import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [totalUsers, totalTrips, completedTrips, approvedRequests] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.trip.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.trip.count({ where: { status: 'COMPLETED' } }),
      this.prisma.joinRequest.count({ where: { status: 'APPROVED' } }),
    ]);

    return {
      totalUsers,
      totalTrips,
      completedTrips,
      approvedRequests,
    };
  }

  async getUsers() {
    return this.prisma.user.findMany({
      include: {
        userProfile: true,
        _count: {
          select: {
            createdTrips: true,
            joinRequests: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTrips() {
    return this.prisma.trip.findMany({
      include: {
        creator: {
          include: { userProfile: true },
        },
        _count: {
          select: { joinRequests: { where: { status: 'APPROVED' } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getJoinRequests() {
    return this.prisma.joinRequest.findMany({
      include: {
        passenger: {
          include: { userProfile: true },
        },
        trip: {
          include: {
            creator: {
              include: { userProfile: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
