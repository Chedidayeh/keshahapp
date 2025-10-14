"use client";

import * as React from "react";
import { Line, LineChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

type TimeSeriesData = {
  date: { value: string };
  total_purchased: number;
};

const chartConfig = {
  total_users: { label: "Total Users", color: "var(--chart-1)" },
  total_purchased: { label: "Purchased", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function ScalpHealthPuchasesChartLine() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("7d"); // default
  const [chartData, setChartData] = React.useState<TimeSeriesData[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (isMobile) setTimeRange("7d");
  }, [isMobile]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/scalp-health-daily-puchases?range=${timeRange}`);
        const data = await res.json();
        setChartData(data.scalpHealth);
      } catch (err) {
        console.error("Failed to fetch chart data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [timeRange]);

  // Calculate totals
  const totalPurchased = chartData.reduce((sum, d) => sum + d.total_purchased, 0);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Purchases
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="size-4 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-sm">
                Total purchased users. Hover a point to see more details.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total purchased users for the selected period
          </span>
          <span className="@[540px]/card:hidden">Purchases</span>
        </CardDescription>

        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
            <ToggleGroupItem value="lastMonth">Last month</ToggleGroupItem>
            <ToggleGroupItem value="lastYear">Last year</ToggleGroupItem>
          </ToggleGroup>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="flex w-40 @[767px]/card:hidden" size="sm">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="lastMonth">Last month</SelectItem>
              <SelectItem value="lastYear">Last year</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <div className="flex items-center justify-center h-56">
            <Spinner />
          </div>
        ) : (
          <>
            <ChartContainer className="aspect-auto h-[250px] w-full" config={chartConfig}>
              <LineChart data={chartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey={(d) => d.date.value}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={20}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <ChartTooltip
                  content={({ payload, label }) => {
                    if (!payload || payload.length === 0) return null;
                    const data = payload[0].payload as TimeSeriesData;
                    return (
                      <div className="bg-white dark:bg-black p-2 rounded shadow">
                        <div className="font-semibold">
                          {new Date(label).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div>Total Purchased: {data.total_purchased}</div>
                      </div>
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="total_purchased"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>

            {/* Totals summary under the chart */}
            <div className="mt-4 flex flex-col sm:flex-row gap-4 justify-between px-2 sm:px-6">
              <div>
                <div className="text-sm text-muted-foreground">Total Purchased</div>
                <div className="text-lg font-semibold">{totalPurchased}</div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
