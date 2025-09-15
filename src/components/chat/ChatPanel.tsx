import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useChatStore } from '@/store/chatStore';
import { Message } from '@/types/analytics';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock, Loader2, MessageSquare, Plus, Send, Trash2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { ChartComponent } from '../../types/analytics';

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
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("");
  const {
    currentSession,
    chatHistory,
    isLoading,
    addMessage,
    removeMessage,
    addComponent,
    setLoading,
    startNewChat,
    loadChatSession,
    deleteFromHistory,
    addChatHistory,
  } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = currentSession?.messages || [];
  const components = currentSession?.components || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  //   e.preventDefault();
  //   if (!input.trim() || isLoading) return;

  //   const userMessage = input.trim();
  //   setInput('');

  //   // Add user message
  //   addMessage({ content: userMessage, type: 'user' });

  //   // Add loading AI message
  //   const loadingId = Math.random().toString(36).substr(2, 9);
  //   addMessage({ content: '', type: 'ai', isLoading: true });

  //   setLoading(true);

  //   try {
  //     const response = await processPrompt(userMessage);

  //     // Remove loading message and add actual response
  //     const updatedMessages = messages.filter(m => !m.isLoading);
  //     addMessage({ content: response.message, type: 'ai' });

  //     // Add component if provided
  //     if (response.component) {
  //       addComponent(response.component);
  //     }
  //   } catch (error) {
  //     addMessage({
  //       content: "I'm sorry, I encountered an error processing your request. Please try again.",
  //       type: 'ai'
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleNewChat = () => {
    startNewChat();
    setQuery('');
  };

  const formatChatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  function detectComponentType(query: string, data: any): ChartComponent["type"] {
    const q = query.toLowerCase();

    if (q.includes("trend") || q.includes("growth") || q.includes("over time")) {
      return "line-chart";
    }
    if (q.includes("distribution") || q.includes("compare") || q.includes("by ")) {
      return "bar-chart";
    }
    if (q.includes("list") || q.includes("show all") || Array.isArray(data)) {
      return "table";
    }
    if (q.includes("total") || q.includes("summary") || typeof data === "number") {
      return "metric-card";
    }

    return "table"; // fallback
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userMessage = query.trim();
    setQuery('');

    // Add user message
    addMessage({ content: userMessage, type: 'user' });

    // Add loading AI message
    const loadingId = Math.random().toString(36).substr(2, 9);
    addMessage({ id: loadingId, content: '', type: 'ai', isLoading: true });

    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: `analytics ${userMessage}`, }),
      });

      const data = await res.json();

      // Remove loading message
      removeMessage(loadingId);

      // Summarize in chat
      const aiResponse =
        data.result.length > 0
          ? data.result
            .map(
              (item: any, idx: number) =>
                `📄 Invoice ${idx + 1}  
• Invoice ID: ${item.invoiceId}  
• Enterprise: ${item.enterpriseName}  
• Date: ${new Date(item.date).toLocaleDateString()}  
• Amount: $${item.totalAmount}  
• Status: ${item.paymentStatus}`
            )
            .join("\n\n") +
          "\n\n👉 Detailed view available in the right-side panel."
          : "No records found.";

      addMessage({ content: aiResponse, type: "ai" });

      // 🔹 Smart detection (or respect explicit type in query)
      const typeMatch = userMessage.match(/type:(\w[\w-]*)/i);
      const detectedType = typeMatch
        ? (typeMatch[1] as ChartComponent["type"])
        : detectComponentType(userMessage, data.result);

      // 🔹 Send structured component to chatStore
      addComponent({
        type: detectedType,
        title: userMessage,
        data: data.result,
      });

      addChatHistory({
        query: userMessage,
        response: aiResponse,
        result: data.result,
        timestamp: new Date().toISOString(),
      });

      // Store raw result if needed
      setResult(data.result);
    } catch (error) {
      removeMessage(loadingId);
      addMessage({
        content:
          "I'm sorry, I encountered an error processing your request. Please try again.",
        type: 'ai',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chat-panel h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Chatlytics
          </h2>
          <div className="flex gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Clock className="h-4 w-4" />
                  History
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Chat History</SheetTitle>
                </SheetHeader>
                <ScrollArea className="mt-4 h-[calc(100vh-8rem)]">
                  <div className="space-y-2">
                    {chatHistory.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No chat history yet</p>
                      </div>
                    ) : (
                      chatHistory.map((session) => (
                        <div
                          key={session.id}
                          className={`p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors group ${session.id === currentSession?.id ? 'bg-blue-100' : 'bg-white'}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <button
                              onClick={() => loadChatSession(session.id)}
                              className="flex-1 text-left"
                            >
                              <div className="font-medium text-sm truncate">
                                {session.name}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {formatChatDate(session.lastUpdated)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {session.messages.length} messages, {session.components.length} charts
                              </div>
                            </button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteFromHistory(session.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
            <Button
              onClick={handleNewChat}
              size="sm"
              className="gap-2 analytics-gradient"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
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
                <h3 className="font-medium mb-2">Welcome to Chatlytics</h3>
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
            value={query}
            onChange={(e: React.FormEvent<HTMLInputElement>) => setQuery(e.currentTarget.value)}
            placeholder="Ask about analytics data..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!query.trim() || isLoading}
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