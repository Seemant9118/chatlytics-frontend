import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '@/store/chatStore';
import { BarChart } from './charts/BarChart';
import { LineChart } from './charts/LineChart';
import { MetricCards } from './charts/MetricCards';
import { DataTable } from './charts/DataTable';
import { ChartComponent } from '@/types/analytics';

const ChartRenderer = ({ component }: { component: ChartComponent }) => {
  const renderChart = () => {
    switch (component.type) {
      case 'bar-chart':
        return <BarChart data={component.data} title={component.title} />;
      case 'line-chart':
        return <LineChart data={component.data} title={component.title} />;
      case 'metric-card':
        return <MetricCards data={component.data} title={component.title} />;
      case 'table':
        return <DataTable data={component.data} title={component.title} />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="chart-container fade-in"
    >
      {renderChart()}
    </motion.div>
  );
};

export const AnalyticsPanel = () => {
  const { currentSession } = useChatStore();
  const components = currentSession?.components || [];

  return (
    <div className="analytics-panel h-full overflow-auto">
      <div className="p-6">
        <AnimatePresence mode="wait">
          {components.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full min-h-[60vh]"
            >
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-2xl chart-gradient flex items-center justify-center">
                  <span className="text-4xl">📈</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Ready for Analytics
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Charts and data visualizations will appear here as you interact with the AI assistant. 
                  Start a conversation to see dynamic analytics come to life.
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Analytics Dashboard</h2>
                <p className="text-muted-foreground">
                  {components.length} visualization{components.length !== 1 ? 's' : ''} generated
                </p>
              </div>
              
              <AnimatePresence>
                {components.map((component: any) => (
                  <ChartRenderer key={component.id} component={component} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};