/**
 * Global Jest setup — auto-mock ESM-only packages that break CJS mode.
 *
 * expo-server-sdk ships ESM syntax (import.meta.url) that ts-jest cannot
 * transform in CommonJS mode. We mock it globally so every test file in
 * the project avoids the parse error, not just the ones that remember to
 * add jest.mock() at the top.
 */
jest.mock('expo-server-sdk', () => ({
  Expo: jest.fn().mockImplementation(() => ({
    chunkPushNotifications: jest.fn().mockReturnValue([]),
    sendPushNotificationsAsync: jest.fn().mockResolvedValue([]),
  })),
  ExpoPushMessage: jest.fn(),
}));
