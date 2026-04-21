import { Avatar, AvatarFallback, AvatarImage } from '@bo/components/ui/avatar';
import { cn } from '@bo/lib/utils';

interface UserAvatarProfileProps {
  className?: string;
  showInfo?: boolean;
  user: {
    image?: string | null;
    name?: string | null;
    email?: string | null;
  } | null | undefined;
}

export function UserAvatarProfile({
  className,
  showInfo = false,
  user
}: UserAvatarProfileProps) {
  return (
    <div className='flex items-center gap-2'>
      <Avatar className={cn('h-8 w-8', className)}>
        <AvatarImage src={user?.image || ''} alt={user?.name || ''} />
        <AvatarFallback className='rounded-lg uppercase'>
          {user?.name?.slice(0, 2) || 'AD'}
        </AvatarFallback>
      </Avatar>

      {showInfo && (
        <div className='grid flex-1 text-left text-sm leading-tight'>
          <span className='truncate font-semibold'>{user?.name || 'Admin'}</span>
          <span className='truncate text-xs'>
            {user?.email || ''}
          </span>
        </div>
      )}
    </div>
  );
}
