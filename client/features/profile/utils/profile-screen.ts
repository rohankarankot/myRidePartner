export const DUMMY_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix';

export const maskAadhaarNumber = (value?: string | null) => {
  const normalizedValue = value?.replace(/\D/g, '') ?? '';

  if (normalizedValue.length < 4) return 'Not available';
  return `XXXX XXXX ${normalizedValue.slice(-4)}`;
};

export const extractAadhaarNumber = (recognizedText: string[]) => {
  const combinedText = recognizedText.join(' ');
  const continuousMatch = combinedText.match(/(?:^|\D)([2-9]\d{11})(?!\d)/);
  if (continuousMatch) {
    return continuousMatch[1];
  }

  const groupedMatch = combinedText.match(/(?:^|\D)([2-9]\d{3})[\s-]?(\d{4})[\s-]?(\d{4})(?!\d)/);
  return groupedMatch ? `${groupedMatch[1]}${groupedMatch[2]}${groupedMatch[3]}` : null;
};

export const getProfileAvatarUrl = (
  avatar?: string | { url: string; formats?: { small?: { url?: string } } }
) => (typeof avatar === 'string' ? avatar : avatar?.url || avatar?.formats?.small?.url);
