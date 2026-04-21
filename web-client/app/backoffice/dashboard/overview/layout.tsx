import PageContainer from '@bo/components/layout/page-container';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@bo/components/ui/card';
import React from 'react';
import { getAdminStats } from '@bo/lib/admin-api';

export default async function OverViewLayout({
  children,
  sales,
  pie_stats,
  bar_stats,
  area_stats
}: LayoutProps<'/backoffice/dashboard/overview'>) {
  const stats = await getAdminStats();

  const kpi = [
    {
      title: 'Total users',
      value: stats?.totalUsers ?? '—',
      hint: 'Registered accounts (scoped if ADMIN_APP_SOURCE is set on API)'
    },
    {
      title: 'Published trips',
      value: stats?.totalTrips ?? '—',
      hint: 'Trips currently published'
    },
    {
      title: 'Completed trips',
      value: stats?.completedTrips ?? '—',
      hint: 'Trips marked completed'
    },
    {
      title: 'Approved join requests',
      value: stats?.approvedRequests ?? '—',
      hint: 'Passenger requests approved'
    }
  ];

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-center justify-between space-y-2'>
          <h2 className='text-2xl font-bold tracking-tight'>
            Hi, Welcome back 👋
          </h2>
        </div>

        <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
          {kpi.map((item) => (
            <Card key={item.title} className='@container/card'>
              <CardHeader>
                <CardDescription>{item.title}</CardDescription>
                <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                  {item.value}
                </CardTitle>
              </CardHeader>
              <CardFooter className='text-muted-foreground text-sm'>
                {item.hint}
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
          <div className='hidden'>{children}</div>
          <div className='col-span-4'>{bar_stats}</div>
          <div className='col-span-4 md:col-span-3'>{sales}</div>
          <div className='col-span-4'>{area_stats}</div>
          <div className='col-span-4 md:col-span-3'>{pie_stats}</div>
        </div>
      </div>
    </PageContainer>
  );
}
