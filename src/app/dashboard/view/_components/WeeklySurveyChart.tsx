"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, LabelList } from "recharts";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

export const description = "Weekly survey results";

const chartConfig: ChartConfig = {
  yes: { label: "Yes", color: "var(--chart-1)" },
  no: { label: "No", color: "#7a7872" },
};

const questions = ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7"];

export function WeeklySurveyChart() {
  const [week, setWeek] = React.useState<number | null>(null);
  const [days, setDays] = React.useState<number[]>([]);
  const [allData, setAllData] = React.useState<any[]>([]);
  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [noData, setNoData] = React.useState(false); // 🆕 handle completely empty case

  // Fetch all survey data (includes all existing days)
  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch("/api/weekly-survey");
        const json = await res.json();

        if (Array.isArray(json) && json.length > 0) {
          const availableDays = json
            .map((row: any) => row.week)
            .filter((v: any) => v !== null && v !== undefined)
            .sort((a: number, b: number) => a - b);

          setDays(availableDays);
          setAllData(json);
          setNoData(false);

          if (!week && availableDays.length > 0) {
            setWeek(availableDays[0]); // select first existing day by default
          }
        } else {
          setNoData(true);
          setDays([]);
          setAllData([]);
          setWeek(null);
        }
      } catch (err) {
        console.error("Failed to fetch weekly survey data", err);
        setNoData(true);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Build chart data when week changes
  React.useEffect(() => {
    if (!week || allData.length === 0) {
      setData([]);
      return;
    }

    const row = allData.find((r) => r.week === week);
    if (!row) {
      setData([]);
      return;
    }

    const chartData = questions.map((q, index) => {
      const yes = row[`q${index + 1}_yes`] ?? 0;
      const no = row[`q${index + 1}_no`] ?? 0;
      const total = yes + no || 1;
      return {
        question: q,
        yes,
        no,
        yesPct: Math.round((yes / total) * 100),
        noPct: Math.round((no / total) * 100),
      };
    });

    setData(chartData);
  }, [week, allData]);

  return (
    <Card>
      <CardHeader className="gap-2 flex flex-col lg:flex-row lg:justify-between lg:items-center">
        <div className="flex flex-col gap-2">
          <CardTitle className="flex items-center gap-2">
            Weekly Survey Results
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="size-4 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-sm">
                  <p><strong>How the weekly survey data is generated:</strong></p>
                  <ul className="list-disc ml-4 space-y-1">
                    <li>Each record includes a survey day and 7 question answers (q1–q7).</li>
                    <li>Answers are extracted from JSON fields and converted into numbers (1 = Yes, 0 = No).</li>
                    <li>The results are grouped by <strong>day</strong> (representing each week).</li>
                    <li>For every question, the total “Yes” and “No” counts are calculated.</li>
                    <li>Percentage values are computed for both “Yes” and “No” answers.</li>
                  </ul>
                </TooltipContent>



              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <CardDescription>
            {noData
              ? "No survey data found yet"
              : week
                ? `Survey results for day ${week}`
                : "Loading days..."}
          </CardDescription>
        </div>
        <CardAction>
          <Select
            onValueChange={(value) => setWeek(parseInt(value))}
            value={week?.toString() || ""}
            disabled={noData || loading || days.length === 0} // 🆕 disable when no data
          >
            <SelectTrigger className="flex w-44" size="sm">
              <SelectValue placeholder="Select day" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {days.map((d) => (
                <SelectItem key={d} value={d.toString()}>
                  Day {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-56">
            <Spinner />
          </div>
        ) : noData ? (
          <div className="text-center text-muted-foreground py-16">
            No survey data available yet.
          </div>
        ) : data.length === 0 ? (
          <div className="text-center text-muted-foreground py-16">
            No data yet for day {week}
          </div>
        ) : (
          <ChartContainer config={chartConfig}>
            <BarChart data={data} barGap={8} barCategoryGap="20%">
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="question"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="yes" fill="var(--chart-1)" radius={4}>
                <LabelList
                  dataKey="yesPct"
                  position="top"
                  formatter={(val: number) => `${val}%`}
                />
              </Bar>
              <Bar dataKey="no" fill="#7a7872" radius={4}>
                <LabelList
                  dataKey="noPct"
                  position="top"
                  formatter={(val: number) => `${val}%`}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>

      <CardFooter className="flex-col items-start gap-2 text-sm">
        {loading ? (
          <div>Loading data...</div>
        ) : noData ? (
          <div className="text-muted-foreground leading-none">
            No survey results available yet.
          </div>
        ) : (
          <div className="text-muted-foreground leading-none">
            {data.length > 0
              ? `Showing survey answers for day ${week}`
              : `No survey data available for day ${week}`}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
