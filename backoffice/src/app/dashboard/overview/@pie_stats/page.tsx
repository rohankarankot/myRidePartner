import { PieGraph } from '@/features/overview/components/pie-graph';
import { getAdminStats } from '@/lib/admin-api';

export default async function Stats() {
  const stats = await getAdminStats();
  return <PieGraph data={stats?.tripsByStatus ?? []} />;
}
