import { RecentSales } from '@/features/overview/components/recent-sales';
import { getAdminStats } from '@/lib/admin-api';

export default async function Sales() {
  const stats = await getAdminStats();
  return <RecentSales data={stats?.recentUsers ?? []} />;
}
