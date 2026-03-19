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

    // Graph Data calculations
    
    // 1. Recent Users
    const recentUsers = await this.prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { userProfile: true },
    });

    // 2. Trips By Status
    const rawTripsByStatus = await this.prisma.trip.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
    
    // Map to a friendlier array format for the Pie chart
    const tripsByStatus = rawTripsByStatus.map((t) => ({
      status: t.status,
      count: t._count._all,
    }));

    // 3. Registrations By Month (Last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const users = await this.prisma.user.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    });
    
    const registrationsByMonth = this.aggregateByMonth(users, 'createdAt');

    // 4. Activity By Day (Trips & Requests for Last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentTrips = await this.prisma.trip.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    });
    
    const recentRequests = await this.prisma.joinRequest.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    });
    
    const tripsByDay = this.aggregateByDay(recentTrips, 'createdAt');
    const requestsByDay = this.aggregateByDay(recentRequests, 'createdAt');
    
    // Merge into activityByDay
    const dateMap = new Map<string, any>();
    for (const t of tripsByDay) {
      dateMap.set(t.date, { date: t.date, trips: t.count, requests: 0 });
    }
    for (const r of requestsByDay) {
      if (dateMap.has(r.date)) {
        dateMap.get(r.date).requests = r.count;
      } else {
        dateMap.set(r.date, { date: r.date, trips: 0, requests: r.count });
      }
    }
    const activityByDay = Array.from(dateMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return {
      totalUsers,
      totalTrips,
      completedTrips,
      approvedRequests,
      recentUsers,
      tripsByStatus,
      registrationsByMonth,
      activityByDay,
    };
  }

  // Helper function to aggregate records by month
  private aggregateByMonth(data: any[], dateField: string) {
    const counts = data.reduce((acc, curr) => {
      const monthYear = curr[dateField].toLocaleString('en-US', { month: 'short', year: 'numeric' });
      acc[monthYear] = (acc[monthYear] || 0) + 1;
      return acc;
    }, {});
    
    return Object.keys(counts).map(month => ({ month, count: counts[month] }));
  }

  // Helper function to aggregate records by day (YYYY-MM-DD)
  private aggregateByDay(data: any[], dateField: string) {
    const counts = data.reduce((acc, curr) => {
      const date = curr[dateField].toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    
    return Object.keys(counts).map(date => ({ date, count: counts[date] }));
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
