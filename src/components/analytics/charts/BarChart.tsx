import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { EmployeeData } from '@/types/analytics';

interface BarChartProps {
  data: EmployeeData[];
  title: string;
}

const chartConfig = {
  performance: {
    label: "Performance Score",
    color: "hsl(var(--analytics-blue))",
  },
  sales: {
    label: "Sales ($)",
    color: "hsl(var(--analytics-purple))",
  },
};

export const BarChart = ({ data, title }: BarChartProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ChartContainer config={chartConfig} className="h-80">
        <RechartsBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar 
            dataKey="performance" 
            fill="var(--color-performance)"
            radius={[4, 4, 0, 0]}
          />
        </RechartsBarChart>
      </ChartContainer>
      <div className="mt-4 text-sm text-muted-foreground">
        Performance scores ranging from {Math.min(...data.map(d => d.performance))} to {Math.max(...data.map(d => d.performance))}
      </div>
    </div>
  );
};