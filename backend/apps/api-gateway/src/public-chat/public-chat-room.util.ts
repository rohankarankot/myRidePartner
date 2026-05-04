export const normalizePublicChatCity = (value?: string | null) => {
  const normalized = value?.trim().replace(/\s+/g, ' ').toLowerCase();
  return normalized || null;
};

export const buildPublicChatRoomName = (city: string) => `public_chat_${city}`;
