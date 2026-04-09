import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user-service';

export function useCommunityTabScreen() {
  const router = useRouter();

  const { data: communityData, isLoading } = useQuery({
    queryKey: ['community-members-count'],
    queryFn: () => userService.getCommunityMembers({ pageSize: 1 }),
  });

  const totalMembers = communityData?.meta?.pagination?.total || 0;

  return {
    isLoading,
    router,
    totalMembers,
  };
}
