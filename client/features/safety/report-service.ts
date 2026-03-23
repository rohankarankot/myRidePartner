import AsyncStorage from '@react-native-async-storage/async-storage';

const REPORTS_KEY = 'userReports';

export interface StoredReport {
  id: string;
  reportedUserId: number;
  reportedUserName?: string | null;
  reporterUserId?: number | null;
  tripDocumentId?: string | null;
  source: 'trip' | 'profile';
  reasonId: string;
  reasonLabel: string;
  details: string;
  createdAt: string;
}

export async function saveReport(report: Omit<StoredReport, 'id' | 'createdAt'>): Promise<void> {
  const raw = await AsyncStorage.getItem(REPORTS_KEY);
  const existing: StoredReport[] = raw ? JSON.parse(raw) : [];

  const newReport: StoredReport = {
    ...report,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify([...existing, newReport]));
}

export async function getReports(): Promise<StoredReport[]> {
  const raw = await AsyncStorage.getItem(REPORTS_KEY);
  return raw ? JSON.parse(raw) : [];
}
