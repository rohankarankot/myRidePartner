import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user-service';
import { useAuth } from '@/context/auth-context';

export function useUserProfile() {
    const { user } = useAuth();
    return useQuery({
        queryKey: ['user-profile', user?.id],
        queryFn: () => user ? userService.getUserProfile(user.id) : null,
        enabled: !!user,
    });
}
