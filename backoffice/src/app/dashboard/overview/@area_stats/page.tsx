import { AreaGraph } from '@/features/overview/components/area-graph';
import { getAdminStats } from '@/lib/admin-api';

export default async function AreaStats() {
  const stats = await getAdminStats();
  return <AreaGraph data={stats?.registrationsByMonth ?? []} />;
}
