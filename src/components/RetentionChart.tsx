"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function RetentionChart() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchRetention() {
      const res = await fetch("/api/retention");
      const json = await res.json();

      // Transform query result into chart-friendly format
      const formatted = [
        { day: "Day 1", retention: json.day1_retention },
        { day: "Day 3", retention: json.day3_retention },
        { day: "Day 7", retention: json.day7_retention },
        { day: "Day 15", retention: json.day15_retention },
        { day: "Day 30", retention: json.day30_retention },
        { day: "Day 60", retention: json.day60_retention },
        { day: "Day 90", retention: json.day90_retention },
      ];
      setData(formatted);
    }
    fetchRetention();
  }, []);

  return (
    <Card className="p-6 rounded-2xl shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          User Retention Over Time
        </CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="retention"
                stroke="#4F46E5"
                strokeWidth={3}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-sm text-gray-500 mt-8">
            Loading retention data...
          </p>
        )}
      </CardContent>
    </Card>
  );
}
