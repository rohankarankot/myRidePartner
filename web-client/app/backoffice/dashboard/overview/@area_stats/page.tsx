import { AreaGraph } from '@bo/features/overview/components/area-graph';
import { getAdminStats } from '@bo/lib/admin-api';

export default async function AreaStats() {
  const stats = await getAdminStats();
  return <AreaGraph data={stats?.registrationsByMonth ?? []} />;
}
