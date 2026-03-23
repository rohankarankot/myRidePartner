import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { safetyQueryKeys } from '@/features/safety/query-keys';
import { getBlockedUserIds, setBlockedUserIds } from '@/features/safety/storage';

export function useBlockedUsers() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: safetyQueryKeys.blockedUsers,
    queryFn: getBlockedUserIds,
    staleTime: Infinity,
  });

  const blockUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const currentIds = query.data ?? [];
      const nextIds = Array.from(new Set([...currentIds, userId]));
      await setBlockedUserIds(nextIds);
      return nextIds;
    },
    onSuccess: (nextIds) => {
      queryClient.setQueryData(safetyQueryKeys.blockedUsers, nextIds);
    },
  });

  const unblockUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const currentIds = query.data ?? [];
      const nextIds = currentIds.filter((id) => id !== userId);
      await setBlockedUserIds(nextIds);
      return nextIds;
    },
    onSuccess: (nextIds) => {
      queryClient.setQueryData(safetyQueryKeys.blockedUsers, nextIds);
    },
  });

  return {
    blockedUserIds: query.data ?? [],
    isLoading: query.isLoading,
    isBlocking: blockUserMutation.isPending,
    isUnblocking: unblockUserMutation.isPending,
    isBlocked: (userId?: number | null) => (userId ? (query.data ?? []).includes(userId) : false),
    blockUser: blockUserMutation.mutateAsync,
    unblockUser: unblockUserMutation.mutateAsync,
  };
}
