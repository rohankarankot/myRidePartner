import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { Prisma, User, UserAccountStatus } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<(User & { userProfile?: any }) | null> {
    try {
      return await this.prisma.user.findUnique({ 
        where: { email },
        include: { userProfile: true }
      });
    } catch (error) {
      if (!this.isMissingAccountStatusColumnError(error)) {
        throw error;
      }

      return this.findByEmailLegacy(email);
    }
  }

  async findById(id: number): Promise<(User & { userProfile?: any }) | null> {
    try {
      return await this.prisma.user.findUnique({ 
        where: { id },
        include: { userProfile: true }
      });
    } catch (error) {
      if (!this.isMissingAccountStatusColumnError(error)) {
        throw error;
      }

      return this.findByIdLegacy(id);
    }
  }

  async update(id: number, data: any): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
      include: { userProfile: true }
    });
  }

  async pauseAccount(id: number): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          accountStatus: UserAccountStatus.PAUSED,
          pausedAt: new Date(),
        },
        include: { userProfile: true },
      });
    } catch (error) {
      if (this.isMissingAccountStatusColumnError(error)) {
        throw new ServiceUnavailableException(
          'Account pause is not ready yet. Please run the database update for account status fields.',
        );
      }

      throw error;
    }
  }

  async reactivateAccount(id: number): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          accountStatus: UserAccountStatus.ACTIVE,
          pausedAt: null,
        },
        include: { userProfile: true },
      });
    } catch (error) {
      if (this.isMissingAccountStatusColumnError(error)) {
        const legacyUser = await this.findByIdLegacy(id);
        if (!legacyUser) {
          throw error;
        }

        return legacyUser as User;
      }

      throw error;
    }
  }

  async deleteAccount(id: number): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async getUserAnalytics(userId: number) {
    const [postedTrips, approvedRequestsForMyTrips, completedPassengerTrips] = await Promise.all([
      this.prisma.trip.findMany({
        where: { creatorId: userId },
        select: {
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.joinRequest.findMany({
        where: {
          status: 'APPROVED',
          trip: { creatorId: userId },
        },
        select: {
          updatedAt: true,
        },
      }),
      this.prisma.joinRequest.findMany({
        where: {
          passengerId: userId,
          status: 'APPROVED',
          trip: {
            status: 'COMPLETED',
          },
        },
        select: {
          trip: {
            select: {
              pricePerSeat: true,
              updatedAt: true,
            },
          },
        },
      }),
    ]);

    const ridesPosted = postedTrips.length;
    const ridesCompleted = postedTrips.filter((trip) => trip.status === 'COMPLETED').length;
    const requestsApproved = approvedRequestsForMyTrips.length;
    const completionRate = ridesPosted === 0 ? 0 : Math.round((ridesCompleted / ridesPosted) * 100);
    const estimatedMoneySaved = completedPassengerTrips.reduce((sum, request) => {
      return sum + Number(request.trip.pricePerSeat ?? 0);
    }, 0);

    const monthlyActivity = this.buildMonthlyAnalytics(
      postedTrips,
      approvedRequestsForMyTrips,
      completedPassengerTrips,
    );

    return {
      data: {
        summary: {
          ridesPosted,
          requestsApproved,
          ridesCompleted,
          completionRate,
          estimatedMoneySaved: Math.round(estimatedMoneySaved),
        },
        monthlyActivity,
      },
    };
  }

  async getBlockedUserIds(userId: number): Promise<number[]> {
    const blocks = await this.prisma.userBlock.findMany({
      where: { blockerId: userId },
      select: { blockedUserId: true },
      orderBy: { createdAt: 'desc' },
    });

    return blocks.map((block) => block.blockedUserId);
  }

  async blockUser(blockerId: number, blockedUserId: number): Promise<void> {
    if (blockerId === blockedUserId) {
      throw new BadRequestException('You cannot block yourself');
    }

    const blockedUser = await this.findById(blockedUserId);
    if (!blockedUser) {
      throw new NotFoundException('User not found');
    }

    try {
      await this.prisma.userBlock.create({
        data: {
          blocker: { connect: { id: blockerId } },
          blockedUser: { connect: { id: blockedUserId } },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('User is already blocked');
      }

      throw error;
    }
  }

  async unblockUser(blockerId: number, blockedUserId: number): Promise<void> {
    await this.prisma.userBlock.deleteMany({
      where: {
        blockerId,
        blockedUserId,
      },
    });
  }

  private buildMonthlyAnalytics(
    postedTrips: Array<{ createdAt: Date; updatedAt: Date; status: string }>,
    approvedRequestsForMyTrips: Array<{ updatedAt: Date }>,
    completedPassengerTrips: Array<{ trip: { pricePerSeat: Prisma.Decimal | null; updatedAt: Date } }>,
  ) {
    const formatter = new Intl.DateTimeFormat('en-US', { month: 'short' });
    const months: Array<{
      key: string;
      label: string;
      ridesPosted: number;
      requestsApproved: number;
      ridesCompleted: number;
      moneySaved: number;
    }> = [];

    for (let offset = 5; offset >= 0; offset -= 1) {
      const date = new Date();
      date.setDate(1);
      date.setMonth(date.getMonth() - offset);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.push({
        key,
        label: formatter.format(date),
        ridesPosted: 0,
        requestsApproved: 0,
        ridesCompleted: 0,
        moneySaved: 0,
      });
    }

    const monthMap = new Map(months.map((month) => [month.key, month]));
    const getMonthKey = (date: Date) =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    postedTrips.forEach((trip) => {
      const createdMonth = monthMap.get(getMonthKey(trip.createdAt));
      if (createdMonth) {
        createdMonth.ridesPosted += 1;
      }

      if (trip.status === 'COMPLETED') {
        const completedMonth = monthMap.get(getMonthKey(trip.updatedAt));
        if (completedMonth) {
          completedMonth.ridesCompleted += 1;
        }
      }
    });

    approvedRequestsForMyTrips.forEach((request) => {
      const month = monthMap.get(getMonthKey(request.updatedAt));
      if (month) {
        month.requestsApproved += 1;
      }
    });

    completedPassengerTrips.forEach((request) => {
      const month = monthMap.get(getMonthKey(request.trip.updatedAt));
      if (month) {
        month.moneySaved += Math.round(Number(request.trip.pricePerSeat ?? 0));
      }
    });

    return months;
  }

  async createWithGoogle(email: string, name: string, picture: string): Promise<User> {
    const username = email.split('@')[0];
    try {
      return await this.prisma.user.create({
        data: {
          email,
          username,
          provider: "google",
          confirmed: true,
          accountStatus: UserAccountStatus.ACTIVE,
          userProfile: {
            create: {
              fullName: name,
              avatar: picture,
            },
          },
        },
      });
    } catch (error) {
      if (!this.isMissingAccountStatusColumnError(error)) {
        throw error;
      }

      return this.prisma.user.create({
        data: {
          email,
          username,
          provider: "google",
          confirmed: true,
          userProfile: {
            create: {
              fullName: name,
              avatar: picture,
            },
          },
        },
      });
    }
  }

  private async findByEmailLegacy(email: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        u.id,
        u.username,
        u.email,
        u.provider,
        u.password,
        u."resetPasswordToken",
        u."confirmationToken",
        u.confirmed,
        u.blocked,
        u.role,
        'ACTIVE'::text AS "accountStatus",
        NULL::timestamp AS "pausedAt",
        u."createdAt",
        u."updatedAt",
        up.id AS "profileId",
        up."fullName" AS "profileFullName",
        up."phoneNumber" AS "profilePhoneNumber",
        up.avatar AS "profileAvatar",
        up.rating AS "profileRating",
        up."completedTripsCount" AS "profileCompletedTripsCount",
        up."ratingsCount" AS "profileRatingsCount",
        up."isVerified" AS "profileIsVerified",
        up."governmentIdVerified" AS "profileGovernmentIdVerified",
        up.gender AS "profileGender",
        up.city AS "profileCity",
        up."pushToken" AS "profilePushToken",
        up."userId" AS "profileUserId",
        up."createdAt" AS "profileCreatedAt",
        up."updatedAt" AS "profileUpdatedAt"
      FROM "User" u
      LEFT JOIN "UserProfile" up ON up."userId" = u.id
      WHERE u.email = ${email}
      LIMIT 1
    `;

    return this.mapLegacyUserRow(rows[0]);
  }

  private async findByIdLegacy(id: number) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        u.id,
        u.username,
        u.email,
        u.provider,
        u.password,
        u."resetPasswordToken",
        u."confirmationToken",
        u.confirmed,
        u.blocked,
        u.role,
        'ACTIVE'::text AS "accountStatus",
        NULL::timestamp AS "pausedAt",
        u."createdAt",
        u."updatedAt",
        up.id AS "profileId",
        up."fullName" AS "profileFullName",
        up."phoneNumber" AS "profilePhoneNumber",
        up.avatar AS "profileAvatar",
        up.rating AS "profileRating",
        up."completedTripsCount" AS "profileCompletedTripsCount",
        up."ratingsCount" AS "profileRatingsCount",
        up."isVerified" AS "profileIsVerified",
        up."governmentIdVerified" AS "profileGovernmentIdVerified",
        up.gender AS "profileGender",
        up.city AS "profileCity",
        up."pushToken" AS "profilePushToken",
        up."userId" AS "profileUserId",
        up."createdAt" AS "profileCreatedAt",
        up."updatedAt" AS "profileUpdatedAt"
      FROM "User" u
      LEFT JOIN "UserProfile" up ON up."userId" = u.id
      WHERE u.id = ${id}
      LIMIT 1
    `;

    return this.mapLegacyUserRow(rows[0]);
  }

  private mapLegacyUserRow(row: any) {
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      username: row.username,
      email: row.email,
      provider: row.provider,
      password: row.password,
      resetPasswordToken: row.resetPasswordToken,
      confirmationToken: row.confirmationToken,
      confirmed: row.confirmed,
      blocked: row.blocked,
      role: row.role,
      accountStatus: UserAccountStatus.ACTIVE,
      pausedAt: null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      userProfile: row.profileId
        ? {
            id: row.profileId,
            fullName: row.profileFullName,
            phoneNumber: row.profilePhoneNumber,
            avatar: row.profileAvatar,
            rating: row.profileRating,
            completedTripsCount: row.profileCompletedTripsCount,
            ratingsCount: row.profileRatingsCount,
            isVerified: row.profileIsVerified,
            governmentIdVerified: row.profileGovernmentIdVerified,
            gender: row.profileGender,
            city: row.profileCity,
            pushToken: row.profilePushToken,
            userId: row.profileUserId,
            createdAt: row.profileCreatedAt,
            updatedAt: row.profileUpdatedAt,
          }
        : null,
    };
  }

  private isMissingAccountStatusColumnError(error: unknown) {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2022' &&
      typeof error.message === 'string' &&
      (error.message.includes('User.accountStatus') || error.message.includes('User.pausedAt'))
    );
  }
}
