'use client';

import * as React from 'react';
import { IconTrendingUp } from '@tabler/icons-react';
import { Label, Pie, PieChart } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';

const chartConfig = {
  trips: {
    label: 'Trips'
  },
  PUBLISHED: {
    label: 'Published',
    color: 'var(--primary)'
  },
  STARTED: {
    label: 'Started',
    color: 'var(--primary)'
  },
  COMPLETED: {
    label: 'Completed',
    color: 'var(--primary)'
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'var(--primary)'
  }
} satisfies ChartConfig;

export function PieGraph({ data = [] }: { data?: any[] }) {
  const totalTrips = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.count, 0);
  }, [data]);

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>Trips by Status</CardTitle>
        <CardDescription>
          <span className='hidden @[540px]/card:block'>
            Overview of current trips status
          </span>
          <span className='@[540px]/card:hidden'>Trips status</span>
        </CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square h-[250px]'
        >
          <PieChart>
            <defs>
              {['PUBLISHED', 'STARTED', 'COMPLETED', 'CANCELLED'].map(
                (status, index) => (
                  <linearGradient
                    key={status}
                    id={`fill${status}`}
                    x1='0'
                    y1='0'
                    x2='0'
                    y2='1'
                  >
                    <stop
                      offset='0%'
                      stopColor='var(--primary)'
                      stopOpacity={1 - index * 0.15}
                    />
                    <stop
                      offset='100%'
                      stopColor='var(--primary)'
                      stopOpacity={0.8 - index * 0.15}
                    />
                  </linearGradient>
                )
              )}
            </defs>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data.map((item) => ({
                ...item,
                fill: `url(#fill${item.status})`
              }))}
              dataKey='count'
              nameKey='status'
              innerRadius={60}
              strokeWidth={2}
              stroke='var(--background)'
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor='middle'
                        dominantBaseline='middle'
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className='fill-foreground text-3xl font-bold'
                        >
                          {totalTrips.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className='fill-muted-foreground text-sm'
                        >
                          Total Trips
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex-col gap-2 text-sm'>
        <div className='flex items-center gap-2 leading-none font-medium'>
          Current distribution of trips
        </div>
        <div className='text-muted-foreground leading-none'>
          Based on real-time data
        </div>
      </CardFooter>
    </Card>
  );
}
