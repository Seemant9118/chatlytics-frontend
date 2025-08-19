import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricData } from '@/types/analytics';

interface MetricCardsProps {
  data: MetricData[];
  title: string;
}

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'neutral' }) => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case 'down':
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    default:
      return <Minus className="h-4 w-4 text-gray-500" />;
  }
};

export const MetricCards = ({ data, title }: MetricCardsProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.map((metric, index) => (
          <Card key={index} className="chart-container p-0 border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{metric.value}</div>
                {metric.change && metric.trend && (
                  <div className="flex items-center gap-1">
                    <TrendIcon trend={metric.trend} />
                    <span className={`text-sm font-medium ${
                      metric.trend === 'up' 
                        ? 'text-green-600' 
                        : metric.trend === 'down' 
                        ? 'text-red-600' 
                        : 'text-gray-600'
                    }`}>
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-4 text-sm text-muted-foreground">
        All metrics show performance compared to the previous period
      </div>
    </div>
  );
};