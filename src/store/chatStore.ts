import { create } from 'zustand';
import { Message, ChartComponent } from '@/types/analytics';

interface ChatState {
  messages: Message[];
  components: ChartComponent[];
  isLoading: boolean;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  addComponent: (component: Omit<ChartComponent, 'id' | 'timestamp'>) => void;
  setLoading: (loading: boolean) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  components: [],
  isLoading: false,
  
  addMessage: (message) => {
    const newMessage: Message = {
      ...message,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };
    set((state) => ({
      messages: [...state.messages, newMessage],
    }));
  },
  
  addComponent: (component) => {
    const newComponent: ChartComponent = {
      ...component,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };
    set((state) => ({
      components: [...state.components, newComponent],
    }));
  },
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  clearChat: () => set({ messages: [], components: [] }),
}));