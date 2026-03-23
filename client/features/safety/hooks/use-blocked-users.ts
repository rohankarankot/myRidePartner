import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { userService } from '@/features/auth/api/user-service';
import { safetyQueryKeys } from '@/features/safety/query-keys';
import { getBlockedUserIds, setBlockedUserIds } from '@/features/safety/storage';

export function useBlockedUsers() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: safetyQueryKeys.blockedUsers,
    queryFn: async () => {
      try {
        const blockedUserIds = await userService.getBlockedUserIds();
        await setBlockedUserIds(blockedUserIds);
        return blockedUserIds;
      } catch (error) {
        const cachedBlockedUserIds = await getBlockedUserIds();
        return cachedBlockedUserIds;
      }
    },
    staleTime: Infinity,
  });

  const blockUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const currentIds = query.data ?? [];
      const nextIds = Array.from(new Set([...currentIds, userId]));
      await userService.blockUser(userId);
      return nextIds;
    },
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: safetyQueryKeys.blockedUsers });
      const previousIds = queryClient.getQueryData<number[]>(safetyQueryKeys.blockedUsers) ?? [];
      const nextIds = Array.from(new Set([...previousIds, userId]));
      queryClient.setQueryData(safetyQueryKeys.blockedUsers, nextIds);
      await setBlockedUserIds(nextIds);

      return { previousIds };
    },
    onSuccess: async (nextIds) => {
      await setBlockedUserIds(nextIds);
      queryClient.setQueryData(safetyQueryKeys.blockedUsers, nextIds);
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['trip-details'] });
    },
    onError: async (_error, _userId, context) => {
      const previousIds = context?.previousIds ?? [];
      queryClient.setQueryData(safetyQueryKeys.blockedUsers, previousIds);
      await setBlockedUserIds(previousIds);
    },
  });

  const unblockUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const currentIds = query.data ?? [];
      const nextIds = currentIds.filter((id) => id !== userId);
      await userService.unblockUser(userId);
      return nextIds;
    },
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: safetyQueryKeys.blockedUsers });
      const previousIds = queryClient.getQueryData<number[]>(safetyQueryKeys.blockedUsers) ?? [];
      const nextIds = previousIds.filter((id) => id !== userId);
      queryClient.setQueryData(safetyQueryKeys.blockedUsers, nextIds);
      await setBlockedUserIds(nextIds);

      return { previousIds };
    },
    onSuccess: async (nextIds) => {
      await setBlockedUserIds(nextIds);
      queryClient.setQueryData(safetyQueryKeys.blockedUsers, nextIds);
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['trip-details'] });
    },
    onError: async (_error, _userId, context) => {
      const previousIds = context?.previousIds ?? [];
      queryClient.setQueryData(safetyQueryKeys.blockedUsers, previousIds);
      await setBlockedUserIds(previousIds);
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
