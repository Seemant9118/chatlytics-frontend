import { ChartComponent, EmployeeData, SalesData, MetricData } from '@/types/analytics';

const employeeData: EmployeeData[] = [
  { name: 'Sarah Chen', performance: 95, department: 'Sales', sales: 120000, satisfaction: 4.8 },
  { name: 'Marcus Johnson', performance: 88, department: 'Engineering', sales: 85000, satisfaction: 4.6 },
  { name: 'Elena Rodriguez', performance: 92, department: 'Marketing', sales: 98000, satisfaction: 4.7 },
  { name: 'Alex Kim', performance: 87, department: 'Sales', sales: 115000, satisfaction: 4.5 },
  { name: 'David Wilson', performance: 90, department: 'Engineering', sales: 82000, satisfaction: 4.4 },
  { name: 'Lisa Wang', performance: 94, department: 'Marketing', sales: 105000, satisfaction: 4.9 },
];

const salesData: SalesData[] = [
  { month: 'Jan', revenue: 45000, target: 50000, growth: 5.2 },
  { month: 'Feb', revenue: 52000, target: 50000, growth: 8.1 },
  { month: 'Mar', revenue: 48000, target: 55000, growth: -2.3 },
  { month: 'Apr', revenue: 61000, target: 55000, growth: 12.4 },
  { month: 'May', revenue: 55000, target: 60000, growth: 7.8 },
  { month: 'Jun', revenue: 67000, target: 60000, growth: 15.6 },
];

const mockResponses: Record<string, () => Promise<{ message: string; component?: Omit<ChartComponent, 'id' | 'timestamp'> }>> = {
  'employee': async () => ({
    message: "Here's a breakdown of our top-performing employees this year. Sarah Chen leads with exceptional sales performance.",
    component: {
      type: 'bar-chart',
      title: 'Employee Performance Rankings',
      data: employeeData.sort((a, b) => b.performance - a.performance),
    }
  }),
  
  'sales': async () => ({
    message: "Our sales performance shows strong growth in Q2, with June being our best month at $67K revenue.",
    component: {
      type: 'line-chart',
      title: 'Monthly Sales Performance',
      data: salesData,
    }
  }),
  
  'revenue': async () => ({
    message: "Current revenue metrics show positive trends across all key indicators.",
    component: {
      type: 'metric-card',
      title: 'Revenue Metrics',
      data: [
        { label: 'Total Revenue', value: '$328K', change: 12.4, trend: 'up' as const },
        { label: 'Monthly Growth', value: '15.6%', change: 3.2, trend: 'up' as const },
        { label: 'Target Achievement', value: '108%', change: 8.0, trend: 'up' as const },
      ] as MetricData[],
    }
  }),
  
  'table': async () => ({
    message: "Here's a detailed breakdown of employee data with departments and satisfaction scores.",
    component: {
      type: 'table',
      title: 'Employee Details',
      data: employeeData,
    }
  }),
};

export const processPrompt = async (prompt: string): Promise<{ message: string; component?: Omit<ChartComponent, 'id' | 'timestamp'> }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
  
  const lowercasePrompt = prompt.toLowerCase();
  
  // Determine response based on keywords
  if (lowercasePrompt.includes('employee') || lowercasePrompt.includes('best') || lowercasePrompt.includes('performance')) {
    return mockResponses.employee();
  } else if (lowercasePrompt.includes('sales') || lowercasePrompt.includes('monthly')) {
    return mockResponses.sales();
  } else if (lowercasePrompt.includes('revenue') || lowercasePrompt.includes('metrics')) {
    return mockResponses.revenue();
  } else if (lowercasePrompt.includes('table') || lowercasePrompt.includes('detailed') || lowercasePrompt.includes('list')) {
    return mockResponses.table();
  }
  
  // Default response
  return {
    message: "I can help you analyze employee performance, sales data, revenue metrics, or show detailed tables. Try asking about 'best employees', 'monthly sales', or 'revenue metrics'.",
  };
};