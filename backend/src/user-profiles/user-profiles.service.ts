import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '@app/common';
import { Gender } from '@prisma/client';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';

const PUBLIC_EMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  'icloud.com', 'aol.com', 'zoho.com', 'proton.me',
  'protonmail.com', 'mail.com',
];

@Injectable()
export class UserProfilesService {
  private readonly logger = new Logger(UserProfilesService.name);
  private transporter: nodemailer.Transporter;

  constructor(private prisma: PrismaService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });
  }

  async create(data: {
    fullName: string;
    phoneNumber: string;
    gender: Gender;
    userId: number;
  }) {
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
        if (
          data.communityConsent === false &&
          currentProfile.communityConsent === true
        ) {
          // Transition from true to false: START the timer
          data.communityConsentRevokedAt = new Date();
        } else if (data.communityConsent === true) {
          // Setting to true: STOP the timer
          data.communityConsentRevokedAt = null;
        }
      }
    }

    if (data.pushToken !== undefined) {
      this.logger.log(`Updating push token for userProfileId=${documentId}`);
    }

    return this.prisma.userProfile.update({
      where: { id: documentId },
      data,
      include: { user: true },
    });
  }

  async requestOrgVerification(userId: number, email: string) {
    const normalizedEmail = this.normalizeOrgEmail(email);
    const domain = normalizedEmail.split('@')[1];
    if (!domain) {
      throw new BadRequestException('Invalid email format');
    }
    if (PUBLIC_EMAIL_DOMAINS.includes(domain)) {
      throw new BadRequestException('Please use your workplace or university email.');
    }

    const profile = await this.prisma.userProfile.findUnique({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    if (
      profile.isOrganizationVerified &&
      this.normalizeOrgEmail(profile.organizationEmail) === normalizedEmail
    ) {
      throw new BadRequestException('This organization email is already verified.');
    }

    // Rate limiting: Prevent requesting more than once per minute
    if (profile.organizationOtpExpires) {
      const timeRemaining = profile.organizationOtpExpires.getTime() - Date.now();
      if (timeRemaining > 14 * 60 * 1000) { // 15 min expiry, so if > 14 mins left, they just requested it
        throw new BadRequestException('Please wait a minute before requesting another OTP.');
      }
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await this.prisma.userProfile.update({
      where: { userId },
      data: {
        organizationEmail: normalizedEmail, // Temporary hold until verified
        organizationOtpToken: otp,
        organizationOtpExpires: expiresAt,
      },
    });

    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
        await this.transporter.sendMail({
          from: `"myRidePartner" <${process.env.EMAIL_USER}>`,
          to: normalizedEmail,
          subject: 'Your Organization Verification Code',
          text: `Your verification code is: ${otp}. It will expire in 15 minutes.`,
        });
        this.logger.log(`Verification OTP sent to ${normalizedEmail}`);
      } else {
        this.logger.warn(`No EMAIL credentials provided. OTP for ${normalizedEmail} is: ${otp}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send email to ${normalizedEmail}`, error);
      throw new InternalServerErrorException('Failed to send verification email. Please try again later.');
    }

    return { message: 'OTP sent successfully' };
  }

  async confirmOrgVerification(userId: number, email: string, otp: string) {
    const normalizedEmail = this.normalizeOrgEmail(email);
    const profile = await this.prisma.userProfile.findUnique({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    if (this.normalizeOrgEmail(profile.organizationEmail) !== normalizedEmail) {
      throw new BadRequestException('Email mismatch. Please request a new OTP.');
    }

    if (!profile.organizationOtpToken || profile.organizationOtpToken !== otp) {
      throw new BadRequestException('Invalid OTP.');
    }

    if (!profile.organizationOtpExpires || profile.organizationOtpExpires < new Date()) {
      throw new BadRequestException('OTP has expired. Please request a new one.');
    }

    const domain = normalizedEmail.split('@')[1] || '';
    const organizationName = this.deriveOrganizationName(domain);

    await this.prisma.userProfile.update({
      where: { userId },
      data: {
        isOrganizationVerified: true,
        organizationName,
        organizationEmail: normalizedEmail,
        organizationOtpToken: null,
        organizationOtpExpires: null,
      },
    });

    return { message: 'Organization verified successfully' };
  }

  private normalizeOrgEmail(email?: string | null) {
    return email?.trim().toLowerCase() ?? '';
  }

  private deriveOrganizationName(domain: string) {
    const primaryLabel = domain.split('.').filter(Boolean)[0] || '';
    if (!primaryLabel) {
      return 'UNKNOWN';
    }

    return primaryLabel
      .split(/[-_]+/)
      .filter(Boolean)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ');
  }
}
