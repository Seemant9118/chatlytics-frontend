import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  Bar,
  CartesianGrid,
  BarChart as RechartsBarChart,
  XAxis,
  YAxis
} from "recharts";
import { format } from "date-fns";

interface ChartSeries {
  dataKey: string;
  label: string;
  color: string;
}

interface config {
  type: "bar-chart" | "line-chart";
  xAxisKey: string;
  series: ChartSeries[];
}

interface BarChartProps {
  data: any[];
  title: string;
  config: config;
}

export const BarChart = ({ data, title, config }: BarChartProps) => {
  // Normalize data
  const cleanData = data?.map((d) => {
    const newEntry: any = { ...d };

    // Convert date-like X axis
    if (config?.xAxisKey && d[config?.xAxisKey]) {
      const val = d[config?.xAxisKey];
      if (!isNaN(Date.parse(val))) {
        newEntry[config.xAxisKey] = new Date(val);
      }
    }

    // Ensure numeric series values
    config?.series?.forEach((s) => {
      if (d[s.dataKey] !== undefined) {
        newEntry[s.dataKey] = Number(d[s.dataKey]);
      }
    });

    return newEntry;
  });

  // X Axis formatter
  const formatXAxis = (value: any) => {
    if (value instanceof Date) return format(value, "MMM dd");
    return String(value);
  };

  // Y Axis formatter
  const formatYAxis = (value: number) => {
    const label = config.series[0]?.label?.toLowerCase();
    if (label?.includes("amount") || label?.includes("sales") || label?.includes("price")) {
      return `₹${value.toLocaleString()}`;
    }
    return value;
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ChartContainer config={config} className="h-80">
        <RechartsBarChart data={cleanData}>
          <CartesianGrid strokeDasharray="3 3" />

          {/* X Axis */}
          <XAxis
            dataKey={config?.xAxisKey}
            tick={{ fontSize: 12 }}
            tickFormatter={formatXAxis}
            label={{ value: config?.xAxisKey, position: "insideBottom", offset: -5 }}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={80}
          />

          {/* Y Axis */}
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={formatYAxis}
            label={{
              value: config?.series?.map((s) => s.label).join(", "),
              angle: -90,
              position: "insideLeft"
            }}
          />

          {/* Tooltip */}
          <ChartTooltip content={<ChartTooltipContent />} />

          {/* Dynamic Bars */}
          {config?.series?.map((s) => (
            <Bar
              key={s.dataKey}
              dataKey={s.dataKey}
              fill={s.color}
              name={s.label}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ChartContainer>

      {/* Summary */}
      <div className="mt-4 text-sm text-muted-foreground">
        {config?.series.map((s) => {
          const values = data?.map((d) => Number(d[s?.dataKey] || 0));
          const min = Math.min(...values);
          const max = Math.max(...values);
          return (
            <div key={s?.dataKey}>
              {s?.label} ranging from {min} to {max}
            </div>
          );
        })}
      </div>
    </div>
  );
};
