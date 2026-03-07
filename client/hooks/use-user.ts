import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user-service';

export function useUser() {
    return useQuery({
        queryKey: ['user'],
        queryFn: () => userService.getCurrentUser(),
    });
}
