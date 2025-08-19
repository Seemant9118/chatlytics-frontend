import React from 'react';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { AnalyticsPanel } from '@/components/analytics/AnalyticsPanel';

export const AppLayout = () => {
  return (
    <div className="h-screen flex bg-background">
      {/* Chat Panel - Left Side */}
      <div className="w-96 border-r border-border flex-shrink-0">
        <ChatPanel />
      </div>
      
      {/* Analytics Panel - Right Side */}
      <div className="flex-1 min-w-0">
        <AnalyticsPanel />
      </div>
    </div>
  );
};