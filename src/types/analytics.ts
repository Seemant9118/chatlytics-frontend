export interface Message {
  id: string;
  content: string;
  type: 'user' | 'ai';
  timestamp: Date;
  isLoading?: boolean;
}

export interface ChartComponent {
  id: string;
  type: 'bar-chart' | 'line-chart' | 'table' | 'metric-card';
  config: any;
  title: string;
  data: any;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
  components: ChartComponent[];
  createdAt: Date;
  lastUpdated: Date;
}

export interface EmployeeData {
  name: string;
  performance: number;
  department: string;
  sales?: number;
  satisfaction?: number;
}

export interface SalesData {
  month: string;
  revenue: number;
  target?: number;
  growth?: number;
}

export interface MetricData {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
}