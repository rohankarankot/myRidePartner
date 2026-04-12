import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Gender } from '@prisma/client';

@Injectable()
export class UserProfilesService {
  constructor(private prisma: PrismaService) {}

  async create(data: { fullName: string; phoneNumber: string; gender: Gender; userId: number }) {
    return this.prisma.userProfile.create({
      data: {
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        gender: data.gender,
        user: {
          connect: { id: data.userId },
        },
      },
      include: {
        user: true,
      },
    });
  }

  async findByUserId(userId: number) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
      include: { user: true },
    });
    if (!profile) {
      throw new NotFoundException(`Profile for user ${userId} not found`);
    }
    return profile;
  }

  async update(documentId: number, data: any) {
    // Handle community consent revocation logic
    if (data.communityConsent !== undefined) {
      const currentProfile = await this.prisma.userProfile.findUnique({
        where: { id: documentId },
        select: { communityConsent: true },
      });

      if (currentProfile) {
        if (data.communityConsent === false && currentProfile.communityConsent === true) {
          // Transition from true to false: START the timer
          data.communityConsentRevokedAt = new Date();
        } else if (data.communityConsent === true) {
          // Setting to true: STOP the timer
          data.communityConsentRevokedAt = null;
        }
      }
    }

    return this.prisma.userProfile.update({
      where: { id: documentId },
      data,
      include: { user: true },
    });
  }
}
