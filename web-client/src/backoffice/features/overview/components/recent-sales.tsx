import { Avatar, AvatarFallback, AvatarImage } from '@bo/components/ui/avatar';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription
} from '@bo/components/ui/card';

export function RecentSales({ data = [] }: { data?: any[] }) {
  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>Recent Users</CardTitle>
        <CardDescription>Most recently registered users.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-8'>
          {data.map((user, index) => (
            <div key={index} className='flex items-center'>
              <Avatar className='h-9 w-9'>
                <AvatarImage src={user.userProfile?.avatar || ''} alt='Avatar' />
                <AvatarFallback>{user.username?.slice(0, 2).toUpperCase() || 'US'}</AvatarFallback>
              </Avatar>
              <div className='ml-4 space-y-1'>
                <p className='text-sm leading-none font-medium'>{user.userProfile?.fullName || user.username}</p>
                <p className='text-muted-foreground text-sm'>{user.email}</p>
              </div>
              <div className='ml-auto font-medium text-xs text-muted-foreground'>
                {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
