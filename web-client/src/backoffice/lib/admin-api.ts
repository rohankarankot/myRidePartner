import { cache } from 'react';
import { auth } from '@bo/auth';

export type AdminStats = {
  totalUsers: number;
  totalTrips: number;
  completedTrips: number;
  approvedRequests: number;
  recentUsers: Array<{
    id: number;
    email: string;
    username: string | null;
    createdAt: string;
    userProfile: { fullName: string | null; avatar: string | null } | null;
  }>;
  tripsByStatus: Array<{ status: string; count: number }>;
  registrationsByMonth: Array<{ month: string; count: number }>;
  activityByDay: Array<{ date: string; trips: number; requests: number }>;
};

async function getAccessToken(): Promise<string | null> {
  const session = await auth();
  return (session as { accessToken?: string } | null)?.accessToken ?? null;
}

export const getAdminStats = cache(async (): Promise<AdminStats | null> => {
  const token = await getAccessToken();
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!token || !base) {
    return null;
  }
  const res = await fetch(`${base}/api/admin/stats`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) {
    return null;
  }
  return res.json();
});
