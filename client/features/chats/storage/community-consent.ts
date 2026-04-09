import AsyncStorage from '@react-native-async-storage/async-storage';

const COMMUNITY_CONSENT_KEY = 'communityConsentAccepted';

function getCommunityConsentKey(userId: number) {
  return `${COMMUNITY_CONSENT_KEY}:${userId}`;
}

export async function getStoredCommunityConsent(userId: number): Promise<boolean> {
  const value = await AsyncStorage.getItem(getCommunityConsentKey(userId));
  return value === 'true';
}

export async function persistCommunityConsent(userId: number): Promise<void> {
  await AsyncStorage.setItem(getCommunityConsentKey(userId), 'true');
}

export async function clearStoredCommunityConsent(userId: number): Promise<void> {
  await AsyncStorage.removeItem(getCommunityConsentKey(userId));
}
