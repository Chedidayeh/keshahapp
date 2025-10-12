"use client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import * as React from "react";
import { Line, LineChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Spinner } from "@/components/ui/spinner";
import { Info } from "lucide-react";

type RetentionData = {
  day1_retention: number;
  day1_users: number;
  day3_retention: number;
  day3_users: number;
  day7_retention: number;
  day7_users: number;
  day15_retention: number;
  day15_users: number;
  day30_retention: number;
  day30_users: number;
  day60_retention: number;
  day60_users: number;
  day90_retention: number;
  day90_users: number;
};

type ChartPoint = {
  day: string;
  retention: number;
  users: number;
};

export function ChartLineRetention() {
  const [chartData, setChartData] = React.useState<ChartPoint[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/retention");
        const data: RetentionData = await res.json();

        // Transform API response into chart points
        const points: ChartPoint[] = [
          { day: "Day 1", retention: data.day1_retention, users: data.day1_users },
          { day: "Day 3", retention: data.day3_retention, users: data.day3_users },
          { day: "Day 7", retention: data.day7_retention, users: data.day7_users },
          { day: "Day 15", retention: data.day15_retention, users: data.day15_users },
          { day: "Day 30", retention: data.day30_retention, users: data.day30_users },
          { day: "Day 60", retention: data.day60_retention, users: data.day60_users },
          { day: "Day 90", retention: data.day90_retention, users: data.day90_users },
        ];

        setChartData(points);
      } catch (err) {
        console.error("Failed to fetch retention data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartConfig = {
    retention: { label: "Retention %", color: "var(--chart-1)" },
  } satisfies ChartConfig;

  return (
    <Card className="@container/card">
      <CardHeader>
<CardTitle className="flex items-center gap-2">
  User Retention
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="size-4 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-sm">
        <p><strong>How retention is calculated:</strong></p>
        <ul className="list-disc ml-4 space-y-1">
          <li><strong>Eligible Users:</strong> Users who created their account at least N days ago (N = 1, 3, 7, 15, 30, 60, 90).</li>
          <li><strong>Active Users:</strong> Users who were active on that specific day (based on progress entries).</li>
          <li><strong>Retention %:</strong> (Active Users ÷ Eligible Users) × 100, rounded to 2 decimal places.</li>
          <li>Both the percentage and the number of eligible users are displayed in the chart tooltip.</li>
        </ul>
        <p className="mt-1 text-xs text-muted-foreground">
          Example: If 100 users were eligible on Day 7 and 40 were active, Day 7 retention = 40%.
        </p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</CardTitle>

        <CardDescription>Percentage of users retained over time</CardDescription>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <div className="flex items-center justify-center h-56">
            <Spinner />
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <LineChart data={chartData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
<ChartTooltip
  cursor={false}
  content={({ active, payload, label }) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload as ChartPoint;
      return (
        <div className=" border rounded p-2 shadow">
          <div className="font-medium">{data.day}</div>
          <div>Retention: {data.retention}%</div>
          <div>Users: {data.users}</div>
        </div>
      );
    }
    return null;
  }}
/>

              <Line
                type="monotone"
                dataKey="retention"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
