import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardAction
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaGraph } from './area-graph';
import { BarGraph } from './bar-graph';
import { PieGraph } from './pie-graph';
import { RecentSales } from './recent-sales';
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';

import { auth } from '@/auth';

export default async function OverViewPage() {
  const session = await auth();
  const token = (session as any)?.accessToken;

  let stats = {
    totalUsers: 0,
    totalTrips: 0,
    completedTrips: 0,
    approvedRequests: 0,
  };

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    if (res.ok) {
      stats = await res.json();
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error);
  }

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-center justify-between space-y-2'>
          <h2 className='text-2xl font-bold tracking-tight'>
            Hi {session?.user?.name || 'Admin'}, Welcome back 👋
          </h2>
          <div className='hidden items-center space-x-2 md:flex'>
            <Button>Download Report</Button>
          </div>
        </div>
        <Tabs defaultValue='overview' className='space-y-4'>
          <TabsList>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='analytics' disabled>
              Analytics
            </TabsTrigger>
          </TabsList>
          <TabsContent value='overview' className='space-y-4'>
            <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4'>
              <Card className='@container/card'>
                <CardHeader>
                  <CardDescription>Total Users</CardDescription>
                  <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                    {stats.totalUsers.toLocaleString()}
                  </CardTitle>
                </CardHeader>
                <CardFooter className='flex-col items-start gap-1.5 text-sm'>
                  <div className='text-muted-foreground'>
                    Total registered users in system
                  </div>
                </CardFooter>
              </Card>
              <Card className='@container/card'>
                <CardHeader>
                  <CardDescription>Published Trips</CardDescription>
                  <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                    {stats.totalTrips.toLocaleString()}
                  </CardTitle>
                </CardHeader>
                <CardFooter className='flex-col items-start gap-1.5 text-sm'>
                  <div className='text-muted-foreground'>
                    Active trips currently published
                  </div>
                </CardFooter>
              </Card>
              <Card className='@container/card'>
                <CardHeader>
                  <CardDescription>Approved Joins</CardDescription>
                  <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                    {stats.approvedRequests.toLocaleString()}
                  </CardTitle>
                </CardHeader>
                <CardFooter className='flex-col items-start gap-1.5 text-sm'>
                  <div className='text-muted-foreground'>
                    Successfully matched passengers
                  </div>
                </CardFooter>
              </Card>
              <Card className='@container/card'>
                <CardHeader>
                  <CardDescription>Completed Trips</CardDescription>
                  <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                    {stats.completedTrips.toLocaleString()}
                  </CardTitle>
                </CardHeader>
                <CardFooter className='flex-col items-start gap-1.5 text-sm'>
                  <div className='text-muted-foreground'>
                    Trips successfully finished
                  </div>
                </CardFooter>
              </Card>
            </div>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
              <div className='col-span-4'>
                <BarGraph />
              </div>
              <Card className='col-span-4 md:col-span-3'>
                <RecentSales />
              </Card>
              <div className='col-span-4'>
                <AreaGraph />
              </div>
              <div className='col-span-4 md:col-span-3'>
                <PieGraph />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
