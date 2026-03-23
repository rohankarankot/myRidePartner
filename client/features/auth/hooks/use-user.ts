import { useQuery } from '@tanstack/react-query';

import { userService } from '@/features/auth/api/user-service';
import { authQueryKeys } from '@/features/auth/query-keys';

export function useUser() {
  return useQuery({
    queryKey: authQueryKeys.currentUser,
    queryFn: () => userService.getCurrentUser(),
  });
}
