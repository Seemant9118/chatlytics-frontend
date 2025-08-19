import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { SalesData } from '@/types/analytics';

interface LineChartProps {
  data: SalesData[];
  title: string;
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--analytics-blue))",
  },
  target: {
    label: "Target",
    color: "hsl(var(--analytics-purple))",
  },
};

export const LineChart = ({ data, title }: LineChartProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ChartContainer config={chartConfig} className="h-80">
        <RechartsLineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="var(--color-revenue)"
            strokeWidth={3}
            dot={{ fill: "var(--color-revenue)", strokeWidth: 2, r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="target" 
            stroke="var(--color-target)"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: "var(--color-target)", strokeWidth: 2, r: 3 }}
          />
        </RechartsLineChart>
      </ChartContainer>
      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="font-semibold text-lg">${data.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()}</div>
          <div className="text-muted-foreground">Total Revenue</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-lg">${Math.max(...data.map(d => d.revenue)).toLocaleString()}</div>
          <div className="text-muted-foreground">Peak Month</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-lg">{Math.round(data.reduce((sum, d) => sum + (d.growth || 0), 0) / data.length)}%</div>
          <div className="text-muted-foreground">Avg Growth</div>
        </div>
      </div>
    </div>
  );
};