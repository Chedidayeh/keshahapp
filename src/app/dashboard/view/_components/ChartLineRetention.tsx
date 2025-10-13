"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
import { Spinner } from "@/components/ui/spinner";
import { Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type RetentionApiResponse = {
  day1_retention: number;
  day1_completed_retention: number;
  day1_users: number;
  day3_retention: number;
  day3_completed_retention: number;
  day3_users: number;
  day7_retention: number;
  day7_completed_retention: number;
  day7_users: number;
  day15_retention: number;
  day15_completed_retention: number;
  day15_users: number;
  day30_retention: number;
  day30_completed_retention: number;
  day30_users: number;
  day60_retention: number;
  day60_completed_retention: number;
  day60_users: number;
  day90_retention: number;
  day90_completed_retention: number;
  day90_users: number;
};

type ChartPoint = {
  day: string;
  retention: number;
  completedRetention: number;
  users: number;
};

// Update chartConfig with red and blue
// const chartConfig = {
//   retention: { label: "Retention %", color: "#007bff" },         // Blue
//   completedRetention: { label: "Completed Exercises %", color: "#ff4d4f" }, // Red
// } satisfies ChartConfig;

const chartConfig = {
  retention: { label: "Active Users %", color: "var(--chart-1)" },
  completedRetention: { label: "Completed Exercises %", color: "#808080" }, // changed to gray
} satisfies ChartConfig;



export function ChartLineRetention() {
  const [chartData, setChartData] = React.useState<ChartPoint[]>([]);
  const [userTypes, setUserTypes] = React.useState<string[]>([]);
  const [selectedUserType, setSelectedUserType] = React.useState<string>("all");
  const [loading, setLoading] = React.useState(true);

  // 🧩 Fetch user types
  React.useEffect(() => {
    const fetchUserTypes = async () => {
      try {
        const res = await fetch("/api/user-types");
        const data = await res.json();
        setUserTypes(["all", ...data.map((item: any) => item.user_type)]);
      } catch (err) {
        console.error("Failed to fetch user types:", err);
      }
    };
    fetchUserTypes();
  }, []);

  // 📊 Fetch retention data based on selected user type
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/retention?user_type=${selectedUserType}`);
        const data: RetentionApiResponse = await res.json();

        const points: ChartPoint[] = [
          { day: "Day 1", retention: data.day1_retention, completedRetention: data.day1_completed_retention, users: data.day1_users },
          { day: "Day 3", retention: data.day3_retention, completedRetention: data.day3_completed_retention, users: data.day3_users },
          { day: "Day 7", retention: data.day7_retention, completedRetention: data.day7_completed_retention, users: data.day7_users },
          { day: "Day 15", retention: data.day15_retention, completedRetention: data.day15_completed_retention, users: data.day15_users },
          { day: "Day 30", retention: data.day30_retention, completedRetention: data.day30_completed_retention, users: data.day30_users },
          { day: "Day 60", retention: data.day60_retention, completedRetention: data.day60_completed_retention, users: data.day60_users },
          { day: "Day 90", retention: data.day90_retention, completedRetention: data.day90_completed_retention, users: data.day90_users },
        ];

        setChartData(points);
      } catch (err) {
        console.error("Failed to fetch retention data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedUserType]);



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
                  <li><strong>Eligible Users:</strong> Users who created their account at least N days ago.</li>
                  <li><strong>Active Users:</strong> Users who were active on that day (had any progress recorded).</li>
                  <li><strong>Completed Exercises:</strong> Users who completed <em>all exercises</em> for that day.</li>
                  <li><strong>Active Users Retention %:</strong> (Active Users ÷ Eligible Users) × 100.</li>
                  <li><strong>Completed Retention %:</strong> (Users with all exercises completed ÷ Eligible Users) × 100.</li>
                  <li><strong>Intervals:</strong> Calculated for day1, day3, day7, day15, day30, day60, and day90.</li>
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>

        <CardDescription>Percentage of users retained over time</CardDescription>

        <CardAction>
          <Select
            value={selectedUserType}
            onValueChange={(value) => setSelectedUserType(value)}
          >
            <SelectTrigger className="flex w-44" size="sm">
              <SelectValue placeholder="Select user type" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {userTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type === "all" ? "All Users" : type}
                </SelectItem>
              ))}
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
{/* Legend */}
<div className="flex gap-6 mb-2 items-center">
  {Object.entries(chartConfig).map(([key, config]) => (
    <div key={key} className="flex items-center gap-2">
      {/* Line sample for legend */}
      <div
        style={{
          width: "24px",
          height: "2px",
          backgroundColor: key === "completedRetention" ? "transparent" : config.color,
          borderTop: key === "completedRetention" ? `2px dashed ${config.color}` : undefined,
        }}
      />
      <span className="text-sm">{config.label}</span>
    </div>
  ))}
</div>


<ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
  <LineChart data={chartData}>
    <CartesianGrid vertical={false} strokeDasharray="3 3" />
    <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
    <ChartTooltip
      cursor={false}
      content={({ active, payload }) => {
        if (active && payload && payload.length > 0) {
          const data = payload[0].payload as ChartPoint;
          return (
            <div className="border bg-white dark:bg-black rounded p-2 shadow">
              <div className="font-medium">{data.day}</div>
              <div>Active Users: {data.retention}%</div>
              <div>Completed: {data.completedRetention}%</div>
              <div>Users: {data.users}</div>
            </div>
          );
        }
        return null;
      }}
    />
{Object.entries(chartConfig).map(([key, config]) => (
  <Line
    key={key}
    type="monotone"
    dataKey={key}
    stroke={config.color}
    strokeWidth={2}
    dot={{ r: 4 }}
    activeDot={{ r: 6 }}
    strokeDasharray={key === "completedRetention" ? "5 5" : undefined} // dashed for completedRetention
  />
))}

  </LineChart>
</ChartContainer>

    </>
  )}
</CardContent>

    </Card>
  );
}
