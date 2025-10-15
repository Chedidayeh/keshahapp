"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, LabelList, TooltipProps } from "recharts";

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

export interface WeeklySurveyQuestion {
  question: string;       // "Q1", "Q2", ...
  questionText: string;       // "I have noticed increased levels of shedding¹., ...
  yes: number;            // number of "Yes" responses
  no: number;             // number of "No" responses
  yesPct: number;         // percentage of Yes
  noPct: number;          // percentage of No
}

export interface WeeklySurveyData {
  week: number;                   // the week number or day
  questions: WeeklySurveyQuestion[]; // array of 7+ questions
  // Optional: if your API also returns raw q1_yes, q2_yes, etc.
  [key: string]: any; 
}


const chartConfig: ChartConfig = {
  yes: { label: "Yes", color: "var(--chart-1)" },
  no: { label: "No", color: "#7a7872" },
};

export function WeeklySurveyChart() {
  const [week, setWeek] = React.useState<number | null>(null);
  const [weeks, setWeeks] = React.useState<number[]>([]);
  const [allData, setAllData] = React.useState<WeeklySurveyData[]>([]);
  const [data, setData] = React.useState<WeeklySurveyQuestion[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [noData, setNoData] = React.useState(false);
  console.log("data",data)
  console.log("allData",allData)

  // Fetch all survey data
  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch("/api/weekly-survey");
        const json = await res.json();

        if (Array.isArray(json) && json.length > 0) {
          const availableWeeks = json
            .map((row: any) => row.week)
            .filter((v: any) => v !== null && v !== undefined)
            .sort((a: number, b: number) => a - b);

          setWeeks(availableWeeks);
          setAllData(json);
          setNoData(false);

          if (!week && availableWeeks.length > 0) {
            setWeek(availableWeeks[0]);
          }
        } else {
          setNoData(true);
          setWeeks([]);
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
  
    // Dynamically get all question texts and counts
    const chartData = Object.keys(row)
      .filter((key) => key.endsWith("_text"))
      .sort() // ensure Q1, Q2, ... order
      .map((key, index) => {
        const qIndex = key.replace("_text", "").replace("q", ""); // e.g., "1"
        const yes = row[`q${qIndex}_yes`] ?? 0;
        const no = row[`q${qIndex}_no`] ?? 0;
        const total = yes + no || 1;
  
        return {
          question: `Q${index + 1}`,  // hardcoded Q1, Q2, ...
          questionText: row[key],      // full question text
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
                    <li>Each record includes a survey week and 7 question answers (q1–q7).</li>
                    <li>Answers are counted as Yes/No and converted into percentages.</li>
                    <li>The results are grouped by week.</li>
                  </ul>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <CardDescription>
            {noData
              ? "No survey data found yet"
              : week
                ? `Survey results for week ${week}`
                : "Loading weeks..."}
          </CardDescription>
        </div>
        <CardAction>
          <Select
            onValueChange={(value) => setWeek(parseInt(value))}
            value={week?.toString() || ""}
            disabled={noData || loading || weeks.length === 0}
          >
            <SelectTrigger className="flex w-44" size="sm">
              <SelectValue placeholder="Select week" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {weeks.map((w) => (
                <SelectItem key={w} value={w.toString()}>
                  Week {w}
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
            No data yet for week {week}
          </div>
        ) : (
          <ChartContainer config={chartConfig}>
  <BarChart data={data} barGap={8} barCategoryGap="20%">
    <CartesianGrid vertical={false} />
    <XAxis
      dataKey="question" // <-- show Q1, Q2, Q3 on X axis
      tickLine={false}
      tickMargin={10}
      axisLine={false}
    />
<ChartTooltip
  cursor={false}
  content={(props: TooltipProps<number, string>) => {
    const { active, payload } = props;
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload; // full question object
    return (
      <div className="bg-white dark:bg-black p-2 shadow-lg rounded border">
        <div className="flex flex-col gap-1">
          <div className="font-semibold">{data.question}:</div>
          <div className="text-sm text-muted-foreground">{data.questionText}</div>
        </div>

        <div className="mt-2 text-sm flex flex-col gap-1">
          <span className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ backgroundColor: chartConfig.yes.color }}
            ></span>
            Yes: {data.yes}
          </span>
          <span className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ backgroundColor: chartConfig.no.color }}
            ></span>
            No: {data.no}
          </span>
        </div>
      </div>
    );
  }}
/>

✅ Key p
    <Bar dataKey="yes" fill={chartConfig.yes.color} radius={4}>
      <LabelList
        dataKey="yesPct"
        position="top"
        formatter={(val: number) => `${val}%`}
      />
    </Bar>
    <Bar dataKey="no" fill={chartConfig.no.color} radius={4}>
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
              ? `Showing survey answers for week ${week}`
              : `No survey data available for week ${week}`}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
