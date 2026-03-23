export const authQueryKeys = {
  currentUser: ['user'] as const,
  userProfile: (userId?: number) => ['user-profile', userId] as const,
};
