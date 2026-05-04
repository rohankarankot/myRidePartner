import { AdminService } from './admin.service';

describe('AdminService', () => {
  const createService = () => {
    const prisma = {
      user: { findUnique: jest.fn() },
      trip: { findMany: jest.fn() },
      joinRequest: { findMany: jest.fn() },
      userReport: { findMany: jest.fn() },
      notification: { findMany: jest.fn() },
      userAppSource: { findMany: jest.fn() },
      adminAuditLog: { create: jest.fn() },
    };
    const config = { get: jest.fn() };
    const service = new AdminService(prisma as any, config as any);
    return { service, prisma, config };
  };

  it('should be defined', () => {
    const { service } = createService();
    expect(service).toBeDefined();
  });

  it('returns the snapshot even if notifications fail to load', async () => {
    const { service, prisma } = createService();
    const user = {
      id: 42,
      email: 'user@example.com',
      username: 'rider',
      blocked: false,
      accountStatus: 'ACTIVE',
      role: 'USER',
      createdAt: new Date('2026-04-11T00:00:00.000Z'),
      userProfile: null,
      _count: {
        createdTrips: 1,
        joinRequests: 2,
        reportsGiven: 0,
        reportsReceived: 0,
      },
    };

    prisma.user.findUnique.mockResolvedValue(user);
    prisma.trip.findMany.mockResolvedValue([
      {
        documentId: 'trip-1',
        startingPoint: 'A',
        destination: 'B',
        date: '2026-04-11',
        time: '10:00',
        status: 'PUBLISHED',
        createdAt: new Date('2026-04-11T10:00:00.000Z'),
      },
    ]);
    prisma.joinRequest.findMany.mockResolvedValue([]);
    prisma.userReport.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    prisma.notification.findMany.mockRejectedValue(
      new Error('bad notification row'),
    );

    jest
      .spyOn(service as any, 'requireUserInScopeOr404')
      .mockResolvedValue(undefined);
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    const snapshot = await service.getUserSupportSnapshot(42);

    expect(snapshot.user).toBe(user);
    expect(snapshot.recentTrips).toHaveLength(1);
    expect(snapshot.recentNotifications).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to load admin support snapshot recentNotifications for user 42',
      expect.any(Error),
    );

    consoleErrorSpy.mockRestore();
  });
});
