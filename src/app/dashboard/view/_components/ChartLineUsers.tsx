/* eslint-disable react/jsx-no-useless-fragment */
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
  ChartTooltipContent,
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

type UserChartData = {
  date: string;
  users: number;
};

export function ChartLineUsers() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("7d"); // default to 7 days
  const [chartData, setChartData] = React.useState<UserChartData[]>([]);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    if (isMobile) setTimeRange("3d"); // shorter range for mobile
  }, [isMobile]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/users-chart?range=${timeRange}`);
        const data: UserChartData[] = await res.json();
        setChartData(data);
      } catch (err) {
        console.error("Failed to fetch user chart data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  const chartConfig = {
    users: { label: "Users", color: "var(--chart-1)" },
  } satisfies ChartConfig;

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">New Users 
                     <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="size-4 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-sm">
                  The data shown here represents users based on their
                  <strong> created_at </strong> timestamp — meaning when they
                  created their account.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
        </CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total created users for the selected period
          </span>
          <span className="@[540px]/card:hidden">New Users</span>
        </CardDescription>

        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="3d">Last 3 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last month</ToggleGroupItem>
          </ToggleGroup>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden" size="sm">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="3d" className="rounded-lg">
                Last 3 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last month
              </SelectItem>
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
          
                <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <LineChart data={chartData}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
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
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                  indicator="dot"
                />
              }
            />
            <Line
              type="monotone"
              dataKey="users"
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
