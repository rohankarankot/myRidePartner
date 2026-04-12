import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Prisma,
  TripStatus,
  UserAccountStatus,
  UserRole,
  CommunityGroupStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AdminListQueryDto } from './dto/admin-list-query.dto';
import { AdminReportsQueryDto } from './dto/admin-reports-query.dto';
import { UpdateReportReviewDto } from './dto/update-report-review.dto';
import { AdminTripStatusDto } from './dto/admin-trip-status.dto';

type AdminScope = { mode: 'all' } | { mode: 'scoped'; userIds: number[] };

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private async resolveScope(): Promise<AdminScope> {
    const raw = this.config.get<string>('ADMIN_APP_SOURCE')?.trim();
    if (!raw) {
      return { mode: 'all' };
    }
    const rows = await this.prisma.userAppSource.findMany({
      where: { source: raw },
      select: { userId: true },
    });
    const userIds = [...new Set(rows.map((r) => r.userId))];
    return { mode: 'scoped', userIds };
  }

  private userWhere(scope: AdminScope): Prisma.UserWhereInput {
    if (scope.mode === 'all') {
      return {};
    }
    return { id: { in: scope.userIds } };
  }

  private tripWhere(scope: AdminScope): Prisma.TripWhereInput {
    if (scope.mode === 'all') {
      return {};
    }
    return { creatorId: { in: scope.userIds } };
  }

  private joinRequestWhere(scope: AdminScope): Prisma.JoinRequestWhereInput {
    if (scope.mode === 'all') {
      return {};
    }
    const ids = scope.userIds;
    return {
      OR: [{ passengerId: { in: ids } }, { trip: { creatorId: { in: ids } } }],
    };
  }

  private reportWhere(scope: AdminScope): Prisma.UserReportWhereInput {
    if (scope.mode === 'all') {
      return {};
    }
    const ids = scope.userIds;
    return {
      OR: [{ reporterId: { in: ids } }, { reportedUserId: { in: ids } }],
    };
  }

  private normalizePagination(query: AdminListQueryDto) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit =
      query.limit && query.limit > 0 ? Math.min(query.limit, 100) : 20;
    return { page, limit, skip: (page - 1) * limit };
  }

  private async appendAudit(
    actorId: number,
    action: string,
    entityType: string,
    entityId: string | null,
    metadata?: Record<string, unknown>,
  ) {
    await this.prisma.adminAuditLog.create({
      data: {
        actorId,
        action,
        entityType,
        entityId,
        metadata: metadata ? (metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
    });
  }

  async getStats() {
    const scope = await this.resolveScope();
    if (scope.mode === 'scoped' && scope.userIds.length === 0) {
      return {
        totalUsers: 0,
        totalTrips: 0,
        completedTrips: 0,
        approvedRequests: 0,
        recentUsers: [],
        tripsByStatus: [],
        registrationsByMonth: [],
        activityByDay: [],
      };
    }

    const uWhere = this.userWhere(scope);
    const tWhere = this.tripWhere(scope);
    const jrWhere = this.joinRequestWhere(scope);

    const [totalUsers, totalTrips, completedTrips, approvedRequests] =
      await Promise.all([
        this.prisma.user.count({ where: uWhere }),
        this.prisma.trip.count({
          where: { ...tWhere, status: TripStatus.PUBLISHED },
        }),
        this.prisma.trip.count({
          where: { ...tWhere, status: TripStatus.COMPLETED },
        }),
        this.prisma.joinRequest.count({
          where: { ...jrWhere, status: 'APPROVED' },
        }),
      ]);

    const recentUsers = await this.prisma.user.findMany({
      where: uWhere,
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { userProfile: true },
    });

    const rawTripsByStatus = await this.prisma.trip.groupBy({
      by: ['status'],
      where: tWhere,
      _count: { _all: true },
    });
    const tripsByStatus = rawTripsByStatus.map((t) => ({
      status: t.status,
      count: t._count._all,
    }));

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const usersForReg = await this.prisma.user.findMany({
      where: {
        ...uWhere,
        createdAt: { gte: sixMonthsAgo },
      },
      select: { createdAt: true },
    });
    const registrationsByMonth = this.aggregateByMonth(usersForReg, 'createdAt');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentTrips = await this.prisma.trip.findMany({
      where: { ...tWhere, createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    });
    const recentRequests = await this.prisma.joinRequest.findMany({
      where: { ...jrWhere, createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    });
    const tripsByDay = this.aggregateByDay(recentTrips, 'createdAt');
    const requestsByDay = this.aggregateByDay(recentRequests, 'createdAt');
    const dateMap = new Map<string, { date: string; trips: number; requests: number }>();
    for (const t of tripsByDay) {
      dateMap.set(t.date, { date: t.date, trips: t.count, requests: 0 });
    }
    for (const r of requestsByDay) {
      if (dateMap.has(r.date)) {
        dateMap.get(r.date)!.requests = r.count;
      } else {
        dateMap.set(r.date, { date: r.date, trips: 0, requests: r.count });
      }
    }
    const activityByDay = Array.from(dateMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
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

  private aggregateByMonth(data: { createdAt: Date }[], dateField: keyof (typeof data)[0]) {
    const counts = data.reduce<Record<string, number>>((acc, curr) => {
      const d = curr[dateField] as Date;
      const monthYear = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      acc[monthYear] = (acc[monthYear] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(counts).map((month) => ({ month, count: counts[month] }));
  }

  private aggregateByDay(data: { createdAt: Date }[], dateField: keyof (typeof data)[0]) {
    const counts = data.reduce<Record<string, number>>((acc, curr) => {
      const d = curr[dateField] as Date;
      const date = d.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(counts).map((date) => ({ date, count: counts[date] }));
  }

  async getUsers(query: AdminListQueryDto) {
    const scope = await this.resolveScope();
    if (scope.mode === 'scoped' && scope.userIds.length === 0) {
      return { items: [], total: 0, page: 1, limit: query.limit ?? 20 };
    }
    const { page, limit, skip } = this.normalizePagination(query);
    const search = query.search?.trim();

    const where: Prisma.UserWhereInput = {
      ...this.userWhere(scope),
      ...(search
        ? {
            OR: [
              { email: { contains: search, mode: 'insensitive' } },
              { username: { contains: search, mode: 'insensitive' } },
              {
                userProfile: {
                  fullName: { contains: search, mode: 'insensitive' },
                },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
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
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async getTrips(query: AdminListQueryDto) {
    const scope = await this.resolveScope();
    if (scope.mode === 'scoped' && scope.userIds.length === 0) {
      return { items: [], total: 0, page: 1, limit: query.limit ?? 20 };
    }
    const { page, limit, skip } = this.normalizePagination(query);
    const search = query.search?.trim();

    const where: Prisma.TripWhereInput = {
      ...this.tripWhere(scope),
      ...(search
        ? {
            OR: [
              { startingPoint: { contains: search, mode: 'insensitive' } },
              { destination: { contains: search, mode: 'insensitive' } },
              { documentId: { contains: search, mode: 'insensitive' } },
              { city: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.trip.findMany({
        where,
        include: {
          creator: {
            include: { userProfile: true },
          },
          _count: {
            select: {
              joinRequests: { where: { status: 'APPROVED' } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.trip.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async getJoinRequests(query: AdminListQueryDto) {
    const scope = await this.resolveScope();
    if (scope.mode === 'scoped' && scope.userIds.length === 0) {
      return { items: [], total: 0, page: 1, limit: query.limit ?? 20 };
    }
    const { page, limit, skip } = this.normalizePagination(query);
    const search = query.search?.trim();

    const scopeWhere = this.joinRequestWhere(scope);
    const where: Prisma.JoinRequestWhereInput = search
      ? {
          AND: [
            scopeWhere,
            {
              OR: [
                {
                  passenger: {
                    email: { contains: search, mode: 'insensitive' },
                  },
                },
                {
                  passenger: {
                    username: { contains: search, mode: 'insensitive' },
                  },
                },
                {
                  trip: {
                    startingPoint: { contains: search, mode: 'insensitive' },
                  },
                },
                {
                  trip: {
                    destination: { contains: search, mode: 'insensitive' },
                  },
                },
              ],
            },
          ],
        }
      : scopeWhere;

    const [items, total] = await Promise.all([
      this.prisma.joinRequest.findMany({
        where,
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
        skip,
        take: limit,
      }),
      this.prisma.joinRequest.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async getReports(query: AdminReportsQueryDto) {
    const scope = await this.resolveScope();
    if (scope.mode === 'scoped' && scope.userIds.length === 0) {
      return { items: [], total: 0, page: 1, limit: query.limit ?? 20 };
    }
    const { page, limit, skip } = this.normalizePagination(query);
    const search = query.search?.trim();

    const scopeFilter = this.reportWhere(scope);
    const where: Prisma.UserReportWhereInput = {
      AND: [
        scopeFilter,
        ...(query.status ? [{ reviewStatus: query.status }] : []),
        ...(search
          ? [
              {
                OR: [
                  {
                    documentId: {
                      contains: search,
                      mode: Prisma.QueryMode.insensitive,
                    },
                  },
                  {
                    reporter: {
                      email: {
                        contains: search,
                        mode: Prisma.QueryMode.insensitive,
                      },
                    },
                  },
                  {
                    reportedUser: {
                      email: {
                        contains: search,
                        mode: Prisma.QueryMode.insensitive,
                      },
                    },
                  },
                ],
              },
            ]
          : []),
      ],
    };

    const [items, total] = await Promise.all([
      this.prisma.userReport.findMany({
        where,
        include: {
          reportedUser: { select: { id: true, username: true, email: true } },
          reporter: { select: { id: true, username: true, email: true } },
          reviewedBy: { select: { id: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.userReport.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async updateReportReview(
    actorId: number,
    documentId: string,
    dto: UpdateReportReviewDto,
  ) {
    const report = await this.prisma.userReport.findUnique({
      where: { documentId },
    });
    if (!report) {
      throw new NotFoundException('Report not found');
    }
    await this.assertReportInScope(report);

    const updated = await this.prisma.userReport.update({
      where: { documentId },
      data: {
        reviewStatus: dto.reviewStatus,
        reviewNotes: dto.reviewNotes ?? null,
        reviewedAt: new Date(),
        reviewedById: actorId,
      },
      include: {
        reportedUser: { select: { id: true, username: true, email: true } },
        reporter: { select: { id: true, username: true, email: true } },
        reviewedBy: { select: { id: true, email: true } },
      },
    });

    await this.appendAudit(actorId, 'report.review', 'UserReport', documentId, {
      reviewStatus: dto.reviewStatus,
    });

    return updated;
  }

  private async assertUserInScope(userId: number) {
    const scope = await this.resolveScope();
    if (scope.mode === 'all') {
      return;
    }
    if (!scope.userIds.includes(userId)) {
      throw new ForbiddenException('Resource outside admin scope');
    }
  }

  private async assertReportInScope(report: {
    reporterId: number;
    reportedUserId: number;
  }) {
    const scope = await this.resolveScope();
    if (scope.mode === 'all') {
      return;
    }
    const touchesScope =
      scope.userIds.includes(report.reporterId) ||
      scope.userIds.includes(report.reportedUserId);
    if (!touchesScope) {
      throw new ForbiddenException('Report outside admin scope');
    }
  }

  private async requireUserInScopeOr404(userId: number) {
    const scope = await this.resolveScope();
    if (scope.mode === 'all') {
      return;
    }
    if (!scope.userIds.includes(userId)) {
      throw new NotFoundException('User not found');
    }
  }

  async setUserBlocked(actorId: number, userId: number, blocked: boolean) {
    if (actorId === userId) {
      throw new BadRequestException('Cannot change your own block state');
    }
    const target = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!target) {
      throw new NotFoundException('User not found');
    }
    if (target.role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Cannot modify super admin');
    }
    await this.assertUserInScope(userId);

    await this.prisma.user.update({
      where: { id: userId },
      data: { blocked },
    });

    await this.appendAudit(actorId, blocked ? 'user.block' : 'user.unblock', 'User', String(userId), {
      blocked,
    });
    return { id: userId, blocked };
  }

  async setUserAccountStatus(
    actorId: number,
    userId: number,
    status: UserAccountStatus,
  ) {
    if (actorId === userId) {
      throw new BadRequestException('Cannot change your own account status');
    }
    const target = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!target) {
      throw new NotFoundException('User not found');
    }
    if (target.role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Cannot modify super admin');
    }
    await this.assertUserInScope(userId);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        accountStatus: status,
        pausedAt: status === UserAccountStatus.PAUSED ? new Date() : null,
      },
    });

    await this.appendAudit(actorId, 'user.accountStatus', 'User', String(userId), {
      accountStatus: status,
    });
    return { id: userId, accountStatus: status };
  }

  async setTripStatus(
    actorId: number,
    tripDocumentId: string,
    dto: AdminTripStatusDto,
  ) {
    const trip = await this.prisma.trip.findUnique({
      where: { documentId: tripDocumentId },
    });
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }
    await this.assertUserInScope(trip.creatorId);

    await this.prisma.trip.update({
      where: { documentId: tripDocumentId },
      data: { status: dto.status },
    });

    await this.appendAudit(actorId, 'trip.status', 'Trip', tripDocumentId, {
      status: dto.status,
    });
    return { documentId: tripDocumentId, status: dto.status };
  }

  async getUserSupportSnapshot(userId: number) {
    await this.requireUserInScopeOr404(userId);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userProfile: true,
        _count: {
          select: {
            createdTrips: true,
            joinRequests: true,
            reportsGiven: true,
            reportsReceived: true,
          },
        },
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [
      recentTripsResult,
      recentJoinRequestsResult,
      reportsAsReporterResult,
      reportsAsReportedResult,
      recentNotificationsResult,
    ] = await Promise.allSettled([
      this.prisma.trip.findMany({
        where: { creatorId: userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          documentId: true,
          startingPoint: true,
          destination: true,
          date: true,
          time: true,
          status: true,
          createdAt: true,
        },
      }),
      this.prisma.joinRequest.findMany({
        where: { passengerId: userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          status: true,
          createdAt: true,
          trip: {
            select: {
              documentId: true,
              startingPoint: true,
              destination: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.userReport.findMany({
        where: { reporterId: userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          documentId: true,
          reason: true,
          createdAt: true,
          reportedUser: { select: { id: true, email: true } },
        },
      }),
      this.prisma.userReport.findMany({
        where: { reportedUserId: userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          documentId: true,
          reason: true,
          createdAt: true,
          reporter: { select: { id: true, email: true } },
        },
      }),
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 30,
        select: {
          id: true,
          title: true,
          message: true,
          type: true,
          read: true,
          createdAt: true,
        },
      }),
    ]);

    const withFallback = <T>(label: string, result: PromiseSettledResult<T>, fallback: T): T => {
      if (result.status === 'fulfilled') {
        return result.value;
      }

      console.error(`Failed to load admin support snapshot ${label} for user ${userId}`, result.reason);
      return fallback;
    };

    return {
      user,
      recentTrips: withFallback('recentTrips', recentTripsResult, []),
      recentJoinRequests: withFallback(
        'recentJoinRequests',
        recentJoinRequestsResult,
        [],
      ),
      reportsAsReporter: withFallback(
        'reportsAsReporter',
        reportsAsReporterResult,
        [],
      ),
      reportsAsReported: withFallback(
        'reportsAsReported',
        reportsAsReportedResult,
        [],
      ),
      recentNotifications: withFallback(
        'recentNotifications',
        recentNotificationsResult,
        [],
      ),
    };
  }

  async getNotificationsLog(query: AdminListQueryDto & { userId?: number }) {
    const scope = await this.resolveScope();
    if (scope.mode === 'scoped' && scope.userIds.length === 0) {
      return { items: [], total: 0, page: 1, limit: query.limit ?? 20 };
    }
    if (query.userId != null) {
      await this.assertUserInScope(query.userId);
    }
    const { page, limit, skip } = this.normalizePagination(query);

    const userFilter =
      query.userId != null
        ? { userId: query.userId }
        : scope.mode === 'scoped'
          ? { userId: { in: scope.userIds } }
          : {};

    const where: Prisma.NotificationWhereInput = { ...userFilter };

    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        include: {
          user: {
            select: { id: true, email: true, username: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async getCommunityGroups(query: AdminListQueryDto) {
    const { page, limit, skip } = this.normalizePagination(query);
    const search = query.search?.trim();

    const where: Prisma.CommunityGroupWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { documentId: { contains: search, mode: 'insensitive' } },
            {
              creator: {
                email: { contains: search, mode: 'insensitive' },
              },
            },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.communityGroup.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              email: true,
              userProfile: {
                select: { fullName: true, avatar: true },
              },
            },
          },
          _count: { select: { members: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.communityGroup.count({ where }),
    ]);

    return {
      items: items.map((item) => ({
        ...item,
        memberCount: item._count.members,
        _count: undefined,
      })),
      total,
      page,
      limit,
    };
  }

  async setCommunityGroupStatus(
    actorId: number,
    documentId: string,
    status: 'APPROVED' | 'REJECTED',
  ) {
    const group = await this.prisma.communityGroup.findUnique({
      where: { documentId },
    });

    if (!group) {
      throw new NotFoundException('Community group not found');
    }

    const updated = await this.prisma.communityGroup.update({
      where: { documentId },
      data: {
        status: status as CommunityGroupStatus,
        reviewedAt: new Date(),
        reviewedById: actorId,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
            userProfile: {
              select: { fullName: true, avatar: true },
            },
          },
        },
        _count: { select: { members: true } },
      },
    });

    await this.appendAudit(
      actorId,
      'communityGroup.status',
      'CommunityGroup',
      documentId,
      { status },
    );

    // Send notification to the group creator
    const isApproved = status === 'APPROVED';
    await this.notificationsService.create({
      title: isApproved
        ? '🎉 Community Group Approved!'
        : 'Community Group Rejected',
      message: isApproved
        ? `Your group "${updated.name}" has been approved. Members can now start chatting!`
        : `Your group "${updated.name}" was not approved. Please contact support for details.`,
      type: 'COMMUNITY_GROUP',
      userId: updated.creator.id,
      relatedId: documentId,
      data: { groupName: updated.name, status },
    });

    return {
      ...updated,
      memberCount: updated._count.members,
      _count: undefined,
    };
  }
}
