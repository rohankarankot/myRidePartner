import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';
import { CommunityGroupsService } from './community-groups.service';

@Injectable()
export class CommunityCleanupTask {
  private readonly logger = new Logger(CommunityCleanupTask.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly communityGroupsService: CommunityGroupsService,
  ) {}

  /**
   * Runs every day at midnight to clean up community data for users
   * who opted out more than 30 days ago.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCommunityCleanup() {
    this.logger.log('Starting scheduled community data cleanup...');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Find users who have communityConsent as false and revokedAt older than 30 days
    const profilesToCleanup = await this.prisma.userProfile.findMany({
      where: {
        communityConsent: false,
        communityConsentRevokedAt: {
          not: null,
          lte: thirtyDaysAgo,
        },
      },
      select: {
        userId: true,
      },
    });

    if (profilesToCleanup.length === 0) {
      this.logger.log('No users found for community data cleanup.');
      return;
    }

    this.logger.log(`Found ${profilesToCleanup.length} profiles to clean up.`);

    for (const profile of profilesToCleanup) {
      try {
        await this.communityGroupsService.cleanupUserCommunityData(profile.userId);

        // Reset the revocation timestamp to null to mark it as processed
        await this.prisma.userProfile.update({
          where: { userId: profile.userId },
          data: { communityConsentRevokedAt: null },
        });

        this.logger.log(`Successfully cleaned up community data for user ID: ${profile.userId}`);
      } catch (error) {
        this.logger.error(
          `Failed to clean up community data for user ID: ${profile.userId}`,
          error.stack,
        );
      }
    }

    this.logger.log('Finished scheduled community data cleanup.');
  }
}
