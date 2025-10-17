/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Info } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type ScalpHealthStats = {
  total_users: number;
  total_purchased: number;
  purchase_percentage: number;
};

export function SectionCards() {
  const [stats, setStats] = useState<ScalpHealthStats>({
    total_users: 0,
    total_purchased: 0,
    purchase_percentage: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const res = await fetch("/api/scalp-health-overall-puchases");
        const data = await res.json();
        if (res.ok) {
          setStats(data.scalpHealth);
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
    <Card className="@container/card">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      Freev2 User Purchase Overview
    </CardTitle>

    <CardDescription className="text-sm text-muted-foreground leading-relaxed">
      This dashboard provides insights into <span className="font-semibold text-foreground">freev2 users</span> 
      — showing how many have purchased scalp health support and what percentage of the total user base 
      those purchases represent.  
      Each metric helps measure conversion and engagement trends among free-tier users.
    </CardDescription>
  </CardHeader>
    
    
          <CardContent className="px-2 pt-2 sm:px-6 ">
    
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* 🧍 Total Free Users */}
      <Card>
        <CardHeader>
          <CardDescription className="flex items-center gap-2">Total started freev2 Users
            <Tooltip>
              <TooltipTrigger>
                <Info className="size-4 cursor-pointer text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-sm">
                These are all users that started treatment with <strong>user_type = 'freev2'</strong>.
              </TooltipContent>
            </Tooltip>
          </CardDescription>
          <CardTitle className="text-3xl font-semibold">
            {loading ? "-" : stats.total_users.toLocaleString()}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex items-center justify-between text-sm">
          <div>Total started users with freev2 accounts</div>

        </CardFooter>
      </Card>

      {/* 💳 Purchased Scalp Health Support */}
      <Card>
        <CardHeader>
          <CardDescription className="flex items-center gap-2">Purchased Scalp Health
            <Tooltip>
              <TooltipTrigger>
                <Info className="size-4 cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-sm">
                Calculated as:
                <br />
                <code>
                  (total_purchased / total_users) × 100
                </code>
              </TooltipContent>
            </Tooltip>
          </CardDescription>
          <CardTitle className="text-3xl font-semibold">
            {loading ? "-" : stats.total_purchased.toLocaleString()}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex items-center justify-between text-sm">
          <div>Users who purchased the Scalp Health</div>
        </CardFooter>
      </Card>

      {/* 📈 Purchase Percentage */}
      <Card>
        <CardHeader>
          <CardDescription className="flex items-center gap-2">Purchase Percentage
            <Tooltip>
              <TooltipTrigger>
                <Info className="size-4 cursor-pointer text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-sm">
                Calculated as:
                <br />
                <code>
                  (total_purchased / total_users) × 100
                </code>
              </TooltipContent>
            </Tooltip>
          </CardDescription>
          <CardTitle className="text-3xl font-semibold">
            {loading ? "-" : `${stats.purchase_percentage}%`}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex items-center justify-between text-sm">
          <div>Percentage of free users who made a purchase</div>

        </CardFooter>
      </Card>
    </div>
    </CardContent>
    </Card>
  );
}
