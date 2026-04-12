import apiClient from '@/api/api-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '@/shared/lib/logger';

const PENDING_REPORTS_KEY = 'pending_user_reports';

export interface ReportPayload {
  reasonId: string;
  reasonLabel: string;
  details: string;
  reportedUserId: number;
  reportedUserName?: string | null;
  reporterUserId?: number | null;
  tripDocumentId?: string | null;
  source: 'trip' | 'profile' | 'community_chat' | 'trip_chat' | 'community_group_chat';
  targetType?: 'USER' | 'MESSAGE';
  messageDocumentId?: string | null;
  messagePreview?: string | null;
}

/**
 * Saves a user report to the backend.
 * Falls back to local storage if the API call fails.
 */
export async function saveReport(payload: ReportPayload): Promise<void> {
  try {
    await apiClient.post('/reports', {
      reason: payload.reasonId,
      details: payload.details,
      source: payload.source,
      targetType: payload.targetType,
      reportedUserId: payload.reportedUserId,
      tripDocumentId: payload.tripDocumentId,
      messageDocumentId: payload.messageDocumentId,
      messagePreview: payload.messagePreview,
    });
  } catch (error) {
    logger.warn('Failed to send report to backend, saving locally', { error });
    try {
      const raw = await AsyncStorage.getItem(PENDING_REPORTS_KEY);
      const existing = raw ? JSON.parse(raw) : [];
      await AsyncStorage.setItem(
        PENDING_REPORTS_KEY,
        JSON.stringify([...existing, { ...payload, timestamp: new Date().toISOString() }])
      );
    } catch (storageError) {
      logger.error('Critical failure: Could not save report even to local storage', { storageError });
    }
  }
}
