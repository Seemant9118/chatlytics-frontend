import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Message, ChartComponent, ChatSession } from '@/types/analytics';

interface ChatHistoryEntry {
  query: string;
  response: string;
  result?: any[];
  timestamp: string;
}


interface ChatState {
  currentSession: ChatSession | null;
  chatHistory: ChatHistoryEntry[];
  isLoading: boolean;

  // Current session actions
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  removeMessage: (messageId: string) => void;
  addComponent: (component: Omit<ChartComponent, 'id' | 'timestamp'>) => void;
  setLoading: (loading: boolean) => void;

  // Session management
  startNewChat: () => void;
  loadChatSession: (sessionId: string) => void;
  deleteFromHistory: (sessionId: string) => void;
  clearAllHistory: () => void;
}

const generateSessionName = (firstMessage?: string): string => {
  if (firstMessage) {
    const words = firstMessage.split(' ').slice(0, 4).join(' ');
    return words.length > 30 ? words.substring(0, 30) + '...' : words;
  }
  return `Chat ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

export const useChatStore = create<ChatState & { addChatHistory: (entry: ChatHistoryEntry) => void }>()(
  persist(
    (set, get) => ({
      currentSession: null,
      chatHistory: [],
      isLoading: false,

      addMessage: (message) => {
        const newMessage: Message = {
          ...message,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
        };

        set((state) => {
          let session = state.currentSession;

          // Create new session if none exists
          if (!session) {
            session = {
              id: Math.random().toString(36).substr(2, 9),
              name: generateSessionName(message.type === 'user' ? message.content : undefined),
              messages: [],
              components: [],
              createdAt: new Date(),
              lastUpdated: new Date(),
            };
          }

          const updatedSession = {
            ...session,
            messages: [...session.messages, newMessage],
            lastUpdated: new Date(),
            // Update name based on first user message
            name: session.messages.length === 0 && message.type === 'user'
              ? generateSessionName(message.content)
              : session.name,
          };

          return {
            currentSession: updatedSession,
          };
        });
      },

      removeMessage: (messageId: string) => {
        set((state) => {
          if (!state.currentSession) return state;

          const updatedSession = {
            ...state.currentSession,
            messages: state.currentSession.messages.filter(
              (msg) => msg.id !== messageId
            ),
            lastUpdated: new Date(),
          };

          return {
            currentSession: updatedSession,
          };
        });
      },

      addComponent: (component) => {
        const newComponent: ChartComponent = {
          ...component,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
        };

        set((state) => {
          if (!state.currentSession) return state;

          const updatedSession = {
            ...state.currentSession,
            components: [...state.currentSession.components, newComponent],
            lastUpdated: new Date(),
          };

          return {
            currentSession: updatedSession,
          };
        });
      },

      setLoading: (loading) => set({ isLoading: loading }),

      startNewChat: () => {
        set((state) => {
          // Save current session to history if it has messages
          const newHistory = [...state.chatHistory];
          if (state.currentSession && state.currentSession.messages.length > 0) {
            // Remove any existing session with same ID and add updated one
            const filteredHistory = newHistory.filter(s => s.id !== state.currentSession!.id);
            filteredHistory.unshift(state.currentSession);
            // Keep only last 20 sessions
            if (filteredHistory.length > 20) {
              filteredHistory.splice(20);
            }
          }

          return {
            currentSession: null,
            chatHistory: newHistory,
            isLoading: false,
          };
        });
      },

      loadChatSession: (sessionId) => {
        set((state) => {
          const session = state.chatHistory.find((s) => s.id === sessionId);
          if (session) {
            return {
              currentSession: session, // set as current
              chatHistory: state.chatHistory, // keep all history intact
            };
          }
          return state;
        });
      },

      deleteFromHistory: (sessionId) => {
        set((state) => ({
          chatHistory: state.chatHistory.filter(s => s.id !== sessionId),
        }));
      },

      clearAllHistory: () => {
        set({ chatHistory: [] });
      },

      addChatHistory: (entry: ChatHistoryEntry) => {
        set((state) => {
          const newSession: ChatSession = {
            id: Math.random().toString(36).substr(2, 9),
            name: entry.query.length > 30 ? entry.query.substring(0, 30) + "..." : entry.query,
            messages: [
              { id: Math.random().toString(36).substr(2, 9), content: entry.query, type: 'user', timestamp: new Date(entry.timestamp) },
              { id: Math.random().toString(36).substr(2, 9), content: entry.response, type: 'ai', timestamp: new Date(entry.timestamp) },
            ],
            components: [], // optionally add structured components from entry.result
            createdAt: new Date(entry.timestamp),
            lastUpdated: new Date(entry.timestamp),
          };

          const updatedHistory = [newSession, ...state.chatHistory].slice(0, 20); // keep last 20 sessions
          return { chatHistory: updatedHistory };
        });
      },
    }),
    {
      name: 'analytics-chat-storage',
      partialize: (state) => ({
        chatHistory: state.chatHistory,
      }),
    }
  )
);