import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class RatingsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a rating for a trip's captain.
   */
  async create(data: {
    stars: number;
    comment?: string;
    trip: string; // trip documentId
    rater: number; // rater userId
    ratee: number; // ratee userId (captain)
  }) {
    const trip = await this.prisma.trip.findUnique({
      where: { documentId: data.trip },
      select: { id: true },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    // Check if the rater already rated this trip
    const existing = await this.prisma.rating.findUnique({
      where: {
        tripId_raterId: { tripId: trip.id, raterId: data.rater },
      },
    });

    if (existing) {
      throw new ConflictException('You have already rated this trip');
    }

    const rating = await this.prisma.rating.create({
      data: {
        stars: data.stars,
        comment: data.comment,
        trip: { connect: { id: trip.id } },
        rater: { connect: { id: data.rater } },
        ratee: { connect: { id: data.ratee } },
      },
      include: {
        trip: true,
        rater: { select: { id: true, username: true, email: true } },
        ratee: { select: { id: true, username: true, email: true } },
      },
    });

    // Update ratee's profile: recalculate average rating
    await this.updateRateeProfile(data.ratee);

    return { data: rating };
  }

  /**
   * Get a user's rating for a specific trip.
   */
  async getRatingForTripByUser(tripDocumentId: string, userId: number) {
    const trip = await this.prisma.trip.findUnique({
      where: { documentId: tripDocumentId },
      select: { id: true },
    });

    if (!trip) return null;

    const rating = await this.prisma.rating.findUnique({
      where: {
        tripId_raterId: { tripId: trip.id, raterId: userId },
      },
    });

    return rating;
  }

  /**
   * Recalculate and update ratee's average rating on their profile.
   */
  private async updateRateeProfile(rateeId: number) {
    const aggregation = await this.prisma.rating.aggregate({
      where: { rateeId: rateeId },
      _avg: { stars: true },
      _count: { stars: true },
    });

    const avgRating = aggregation._avg.stars || 0;
    const count = aggregation._count.stars || 0;

    await this.prisma.userProfile.updateMany({
      where: { userId: rateeId },
      data: {
        rating: Math.round(avgRating * 100) / 100,
        ratingsCount: count,
      },
    });
  }
}
