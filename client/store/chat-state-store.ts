import { create } from 'zustand';

interface ChatState {
  activeTripChatId: string | null;
  setActiveTripChatId: (tripId: string | null) => void;
}

export const useChatStateStore = create<ChatState>((set) => ({
  activeTripChatId: null,
  setActiveTripChatId: (tripId) => set({ activeTripChatId: tripId }),
}));
