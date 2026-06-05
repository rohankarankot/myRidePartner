export const DUMMY_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix';



export const getProfileAvatarUrl = (
  avatar?: string | { url: string; formats?: { small?: { url?: string } } }
) => (typeof avatar === 'string' ? avatar : avatar?.url || avatar?.formats?.small?.url);
