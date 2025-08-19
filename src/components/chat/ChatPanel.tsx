import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatStore } from '@/store/chatStore';
import { processPrompt } from '@/services/mockApi';
import { Message } from '@/types/analytics';

const LoadingDots = () => (
  <div className="loading-dots">
    <div className="loading-dot" style={{ '--delay': '0ms' } as React.CSSProperties} />
    <div className="loading-dot" style={{ '--delay': '150ms' } as React.CSSProperties} />
    <div className="loading-dot" style={{ '--delay': '300ms' } as React.CSSProperties} />
  </div>
);

const MessageBubble = ({ message }: { message: Message }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
    className={`message-bubble ${message.type === 'user' ? 'message-user' : 'message-ai'}`}
  >
    {message.isLoading ? (
      <div className="flex items-center gap-2">
        <LoadingDots />
        <span className="text-sm text-muted-foreground">Analyzing...</span>
      </div>
    ) : (
      <p className="text-sm leading-relaxed">{message.content}</p>
    )}
  </motion.div>
);

export const ChatPanel = () => {
  const [input, setInput] = useState('');
  const { messages, isLoading, addMessage, addComponent, setLoading } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    addMessage({ content: userMessage, type: 'user' });

    // Add loading AI message
    const loadingId = Math.random().toString(36).substr(2, 9);
    addMessage({ content: '', type: 'ai', isLoading: true });

    setLoading(true);

    try {
      const response = await processPrompt(userMessage);
      
      // Remove loading message and add actual response
      const updatedMessages = messages.filter(m => !m.isLoading);
      addMessage({ content: response.message, type: 'ai' });

      // Add component if provided
      if (response.component) {
        addComponent(response.component);
      }
    } catch (error) {
      addMessage({ 
        content: "I'm sorry, I encountered an error processing your request. Please try again.", 
        type: 'ai' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-panel h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Analytics Assistant
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Ask me about employee performance, sales data, or revenue metrics
        </p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full analytics-gradient flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="font-medium mb-2">Welcome to Analytics Chat</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Start by asking about employee performance, sales trends, or revenue metrics to see dynamic visualizations.
                </p>
                <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                  <p>Try: "Show me the best employees"</p>
                  <p>Try: "Monthly sales performance"</p>
                  <p>Try: "Revenue metrics overview"</p>
                </div>
              </motion.div>
            ) : (
              messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about analytics data..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            size="icon"
            className="analytics-gradient"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};