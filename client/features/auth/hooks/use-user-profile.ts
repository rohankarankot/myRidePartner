import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/auth-context';
import { userService } from '@/features/auth/api/user-service';
import { authQueryKeys } from '@/features/auth/query-keys';
import { useUserStore } from '@/store/user-store';

export function useUserProfile() {
  const { user } = useAuth();
  const setProfile = useUserStore((state) => state.setProfile);

  const query = useQuery({
    queryKey: authQueryKeys.userProfile(user?.id),
    queryFn: () => (user ? userService.getUserProfile(user.id) : null),
    enabled: !!user,
  });

  useEffect(() => {
    if (query.data) {
      setProfile(query.data);
    }
  }, [query.data, setProfile]);

  return query;
}
