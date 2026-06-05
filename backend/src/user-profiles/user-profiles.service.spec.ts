import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserProfilesService } from './user-profiles.service';

describe('UserProfilesService', () => {
  const prismaMock = {
    userProfile: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  let service: UserProfilesService;

  beforeEach(() => {
    prismaMock.userProfile.findUnique.mockReset();
    prismaMock.userProfile.update.mockReset();
    process.env.EMAIL_USER = '';
    process.env.EMAIL_APP_PASSWORD = '';
    service = new UserProfilesService(prismaMock as any);
  });

  it('normalizes org emails before storing and sending OTPs', async () => {
    prismaMock.userProfile.findUnique.mockResolvedValue({
      id: 1,
      userId: 7,
      isOrganizationVerified: false,
      organizationEmail: null,
      organizationOtpExpires: null,
    });
    prismaMock.userProfile.update.mockResolvedValue({});

    await expect(
      service.requestOrgVerification(7, '  Person@Workplace.com  '),
    ).resolves.toEqual({ message: 'OTP sent successfully' });

    expect(prismaMock.userProfile.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 7 },
        data: expect.objectContaining({
          organizationEmail: 'person@workplace.com',
          organizationOtpToken: expect.any(String),
          organizationOtpExpires: expect.any(Date),
        }),
      }),
    );
  });

  it('rejects verification when the profile email does not match the pending org email', async () => {
    prismaMock.userProfile.findUnique.mockResolvedValue({
      id: 1,
      userId: 7,
      organizationEmail: 'team@workplace.com',
      organizationOtpToken: '123456',
      organizationOtpExpires: new Date(Date.now() + 1000 * 60),
    });

    await expect(
      service.confirmOrgVerification(7, 'other@workplace.com', '123456'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('marks the organization verified and clears OTP state on success', async () => {
    prismaMock.userProfile.findUnique.mockResolvedValue({
      id: 1,
      userId: 7,
      organizationEmail: 'team@acme.com',
      organizationOtpToken: '654321',
      organizationOtpExpires: new Date(Date.now() + 1000 * 60),
    });
    prismaMock.userProfile.update.mockResolvedValue({});

    await expect(
      service.confirmOrgVerification(7, 'TEAM@ACME.com', '654321'),
    ).resolves.toEqual({ message: 'Organization verified successfully' });

    expect(prismaMock.userProfile.update).toHaveBeenCalledWith({
      where: { userId: 7 },
      data: {
        isOrganizationVerified: true,
        organizationName: 'Acme',
        organizationEmail: 'team@acme.com',
        organizationOtpToken: null,
        organizationOtpExpires: null,
      },
    });
  });

  it('throws when the profile is missing', async () => {
    prismaMock.userProfile.findUnique.mockResolvedValue(null);

    await expect(
      service.requestOrgVerification(7, 'team@acme.com'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
