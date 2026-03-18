import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user-service';
import { useAuth } from '@/context/auth-context';
import { useUserStore } from '@/store/user-store';
import { useEffect } from 'react';

export function useUserProfile() {
    const { user } = useAuth();
    const setProfile = useUserStore(state => state.setProfile);
    
    const query = useQuery({
        queryKey: ['user-profile', user?.id],
        queryFn: () => user ? userService.getUserProfile(user.id) : null,
        enabled: !!user,
    });

    useEffect(() => {
        if (query.data) {
            setProfile(query.data);
        }
    }, [query.data, setProfile]);

    return query;
}
