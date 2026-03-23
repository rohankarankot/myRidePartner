export const tripQueryKeys = {
  list: (userId?: number) => ['trips', userId] as const,
  detail: (documentId?: string, userId?: number) => ['trip-details', documentId, userId] as const,
  pagedList: (city?: string, gender?: string, date?: string) =>
    ['all-trips-paged', city, gender, date ?? 'all'] as const,
  chatAccess: (tripId?: string) => ['trip-chat-access', tripId] as const,
  chatMembers: (tripId?: string) => ['trip-chat-members', tripId] as const,
  chatMessages: (tripId?: string) => ['trip-chat-messages', tripId] as const,
};
