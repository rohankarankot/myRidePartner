export const DUMMY_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix';

export const maskAadhaarNumber = (value?: string | null) => {
  if (!value || value.length < 4) return 'Not available';
  return `XXXX XXXX ${value.slice(-4)}`;
};

export const extractAadhaarNumber = (recognizedText: string[]) => {
  const normalizedText = recognizedText.join(' ').replace(/[^\d]/g, '');
  const match = normalizedText.match(/[2-9]\d{11}/);
  return match ? match[0] : null;
};

export const getProfileAvatarUrl = (
  avatar?: string | { url: string; formats?: { small?: { url?: string } } }
) => (typeof avatar === 'string' ? avatar : avatar?.url || avatar?.formats?.small?.url);
