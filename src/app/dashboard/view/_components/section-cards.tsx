/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
"use client";

import { useEffect, useState } from "react";

import { TrendingUp, TrendingDown, Info } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type GroupedUser = {
  user_type: string;
  user_count: number;
};

type Stats = {
  todayUsers: number;
  totalUsers: number;
  last7DaysUsers: number;
  activeUsers: number;
  groupedUsers: GroupedUser[];
};

export function SectionCards() {
  const [stats, setStats] = useState<Stats>({
    todayUsers: 0,
    totalUsers: 0,
    last7DaysUsers: 0,
    activeUsers: 0,
    groupedUsers: [],
  });

  console.log("Stats state:", stats.groupedUsers);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const res = await fetch("/api/user-stats");
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        } else {
          setError(data.error || "Failed to fetch stats");
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);


  
  if (error) {
    return <p className="text-center mt-10 text-red-500">Error: {error}</p>;
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">   
      {/* 1️⃣ Users who started today */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>New Users Today</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {loading ? "-" : stats.todayUsers.toLocaleString()}
          </CardTitle>
          <CardAction>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="size-4 cursor-pointer text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-sm">
                  Number of users who started their treatment today.
                </TooltipContent>
              </Tooltip>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium">
            Started today <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Fresh users joined today</div>
        </CardFooter>
      </Card>

      {/* 2️⃣ Total Users */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Users</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                      {loading ? "-" : stats.totalUsers.toLocaleString()}
          </CardTitle>
          <CardAction>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="size-4 ml-1 cursor-pointer text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-sm">
                  Total number of registered users.
                </TooltipContent>
              </Tooltip>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium">
            Overall registered users
          </div>
          <div className="text-muted-foreground">All-time user count</div>
        </CardFooter>
      </Card>

      {/* 3️⃣ Users started in last 7 days */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>New Users (Last 7 Days)</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                      {loading ? "-" : stats.last7DaysUsers.toLocaleString()}
          </CardTitle>
          <CardAction>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="size-4 ml-1 cursor-pointer text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-sm">
                  Number of users who joined in the last 7 days.
                </TooltipContent>
              </Tooltip>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium">
            Recent growth <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Users joined in the past week</div>
        </CardFooter>
      </Card>

      {/* 4️⃣ Active Users */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Users</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                      {loading ? "-" : stats.activeUsers.toLocaleString()}
          </CardTitle>
          <CardAction>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="size-4 ml-1 cursor-pointer text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-sm">
                  Users active in the last 2 days.
                </TooltipContent>
              </Tooltip>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium">
            Engaged users <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Activity in last 2 days</div>
        </CardFooter>
      </Card>

    </div>
  );
}
