import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  XAxis,
  YAxis
} from "recharts";
import { format } from "date-fns";

export const LineChart = ({ data, title, config }) => {

  // normalize data: convert numbers & dates safely
  const cleanData = data?.map((d) => {
    const newEntry: any = { ...d };

    // If X axis looks like a date string, convert to Date
    if (config.xAxisKey && d[config.xAxisKey]) {
      const val = d[config.xAxisKey];
      if (!isNaN(Date.parse(val))) {
        newEntry[config.xAxisKey] = new Date(val);
      }
    }

    // Ensure numeric series values are numbers
    config?.series?.forEach((s) => {
      if (d[s.dataKey] !== undefined) {
        newEntry[s.dataKey] = Number(d[s.dataKey]);
      }
    });

    return newEntry;
  });

  // Formatter for X-axis
  const formatXAxis = (value: any) => {
    if (value instanceof Date) return format(value, "MMM dd");
    return String(value);
  };

  // Formatter for Y-axis (currency if looks like amount/price, else plain number)
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
        <RechartsLineChart data={cleanData}>
          <CartesianGrid strokeDasharray="3 3" />

          {/* Dynamic X Axis */}
          <XAxis
            dataKey={config.xAxisKey}
            tick={{ fontSize: 12 }}
            tickFormatter={formatXAxis}
            label={{ value: config?.xAxisKey, position: "insideBottom", offset: -5 }}
          />

          {/* Dynamic Y Axis */}
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={formatYAxis}
            label={{ value: config?.series?.map((s) => s.label).join(", "), angle: -90, position: "insideLeft" }}
          />

          <ChartTooltip content={<ChartTooltipContent />} />

          {/* Dynamic series */}
          {config?.series?.map((s) => (
            <Line
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              stroke={s.color}
              strokeWidth={2}
              dot={{ fill: s.color, strokeWidth: 2, r: 3 }}
              name={s.label}
            />
          ))}
        </RechartsLineChart>
      </ChartContainer>
    </div>
  );
};
