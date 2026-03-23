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
