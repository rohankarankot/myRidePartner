import { BarGraph } from '@/features/overview/components/bar-graph';
import { getAdminStats } from '@/lib/admin-api';

export default async function BarStats() {
  const stats = await getAdminStats();
  return <BarGraph data={stats?.activityByDay ?? []} />;
}
