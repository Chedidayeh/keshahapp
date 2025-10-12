"use client";

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

type RetentionData = {
  day1_retention: number;
  day3_retention: number;
  day7_retention: number;
  day15_retention: number;
  day30_retention: number;
  day60_retention: number;
  day90_retention: number;
};

type ChartPoint = {
  day: string;
  retention: number;
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
          { day: "Day 1", retention: data.day1_retention },
          { day: "Day 3", retention: data.day3_retention },
          { day: "Day 7", retention: data.day7_retention },
          { day: "Day 15", retention: data.day15_retention },
          { day: "Day 30", retention: data.day30_retention },
          { day: "Day 60", retention: data.day60_retention },
          { day: "Day 90", retention: data.day90_retention },
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
        <CardTitle>User Retention</CardTitle>
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
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => value}
                  indicator="dot"
                />
              }
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
