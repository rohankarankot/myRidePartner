import AsyncStorage from '@react-native-async-storage/async-storage';

const BLOCKED_USER_IDS_KEY = 'blockedUserIds';

export async function getBlockedUserIds(): Promise<number[]> {
  const rawValue = await AsyncStorage.getItem(BLOCKED_USER_IDS_KEY);

  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue) as number[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function setBlockedUserIds(userIds: number[]) {
  await AsyncStorage.setItem(BLOCKED_USER_IDS_KEY, JSON.stringify(userIds));
}
