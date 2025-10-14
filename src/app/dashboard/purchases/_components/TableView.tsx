"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
interface UserStats {
  total_users: number
  reported_reduction: number
  reduction_percentage_of_total: number
  reported_hair_loss_stopped: number
  stopped_percentage_of_total: number
  purchased_regrowth: number
  purchased_percentage_of_reduction: number
  purchased_percentage_of_total: number
}

interface StatsResponse {
  reduction: UserStats
  stopped: UserStats
}

export function TableView() {
  const [reduction, setReduction] = useState<UserStats>({
    total_users: 0,
    reported_reduction: 0,
    reduction_percentage_of_total: 0,
    reported_hair_loss_stopped: 0,
    stopped_percentage_of_total: 0,
    purchased_regrowth: 0,
    purchased_percentage_of_reduction: 0,
    purchased_percentage_of_total: 0
  })
  const [stopped, setStopped] = useState<UserStats>({
    total_users: 0,
    reported_reduction: 0,
    reduction_percentage_of_total: 0,
    reported_hair_loss_stopped: 0,
    stopped_percentage_of_total: 0,
    purchased_regrowth: 0,
    purchased_percentage_of_reduction: 0,
    purchased_percentage_of_total: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/regrowth-treatment")
        const data = await res.json()

        console.log(data.reduction)
        setReduction(data.reduction)
        setStopped(data.stopped)
      } catch (error) {
        console.error("Failed to fetch user stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])



  return (
    <Card className="@container/card">
<CardHeader>
  <CardTitle className="flex items-center gap-2">
    Hair Loss Progress Metrics (Freev2 Users)
  </CardTitle>

  <CardDescription className="text-sm text-muted-foreground leading-relaxed">
    This data summarizes the behavior of <span className="font-semibold text-foreground">freev2 users </span> 
    who reported either <span className="font-semibold text-foreground">hair loss reduction </span> 
    or <span className="font-semibold text-foreground">hair loss stoppage </span>.  
    It includes percentages showing how many users purchased the 
    <span className="font-semibold text-foreground"> regrowth treatment </span> among those groups.
  </CardDescription>
</CardHeader>


      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">

    <Table>
      <TableCaption>User Stats Summary for FreeV2 Users</TableCaption>

      <TableHeader>
      <TableRow>
  <th className="w-[120px] px-2 py-1 text-left">Metric</th>

  <th className="px-2 py-1 text-left">
    <div className="flex items-center gap-1">
      Total Users
      <Tooltip>
        <TooltipTrigger>
          <Info className="h-4 w-4 cursor-pointer text-muted-foreground" />
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-sm">
          Total number of freev2 users in the dataset.
        </TooltipContent>
      </Tooltip>
    </div>
  </th>

  <th className="px-2 py-1 text-left">
    <div className="flex items-center gap-1">
      Reported Users
      <Tooltip>
        <TooltipTrigger>
          <Info className="h-4 w-4 cursor-pointer text-muted-foreground" />
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-sm">
          Users who reported hair loss reduction or stoppage.
        </TooltipContent>
      </Tooltip>
    </div>
  </th>

  <th className="px-2 py-1 text-left">
    <div className="flex items-center gap-1">
      % Relative to All Users
      <Tooltip>
        <TooltipTrigger>
          <Info className="h-4 w-4 cursor-pointer text-muted-foreground" />
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-sm">
          Percentage of reported users relative to the total users.
        </TooltipContent>
      </Tooltip>
    </div>
  </th>

  <th className="px-2 py-1 text-left">
    <div className="flex items-center gap-1">
      Purchased Regrowth
      <Tooltip>
        <TooltipTrigger>
          <Info className="h-4 w-4 cursor-pointer text-muted-foreground" />
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-sm">
          Number of users who purchased the regrowth treatment.
        </TooltipContent>
      </Tooltip>
    </div>
  </th>

  <th className="px-2 py-1 text-left">
    <div className="flex items-center gap-1">
      % of Reported Users
      <Tooltip>
        <TooltipTrigger>
          <Info className="h-4 w-4 cursor-pointer text-muted-foreground" />
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-sm">
          Percentage of purchased users relative to the reported users.
        </TooltipContent>
      </Tooltip>
    </div>
  </th>

  <th className="px-2 py-1 text-left">
    <div className="flex items-center gap-1">
      % of Total Users
      <Tooltip>
        <TooltipTrigger>
          <Info className="h-4 w-4 cursor-pointer text-muted-foreground" />
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-sm">
          Percentage of purchased users relative to all users.
        </TooltipContent>
      </Tooltip>
    </div>
  </th>
</TableRow>

      </TableHeader>

      <TableBody>
        {/* Reduction Row */}
        <TableRow>
          <TableCell className="font-medium">Reduction of hair loss</TableCell>
          <TableCell>{loading ? "-" : reduction.total_users}</TableCell>
          <TableCell>{loading ? "-" : reduction.reported_reduction}</TableCell>
          <TableCell>{loading ? "-" : reduction.reduction_percentage_of_total + "%"}</TableCell>
          <TableCell>{loading ? "-" : reduction.purchased_regrowth}</TableCell>
          <TableCell>{loading ? "-" : reduction.purchased_percentage_of_reduction + "%"}</TableCell>
          <TableCell>{loading ? "-" : reduction.purchased_percentage_of_total + "%"}</TableCell>
        </TableRow>

        {/* Stopped Row */}
        <TableRow>
          <TableCell className="font-medium">Stopped hair loss</TableCell>
          <TableCell>{loading ? "-" : stopped.total_users}</TableCell>
          <TableCell>{loading ? "-" : stopped.reported_hair_loss_stopped}</TableCell>
          <TableCell>{loading ? "-" : stopped.stopped_percentage_of_total + "%"}</TableCell>
          <TableCell>{loading ? "-" : stopped.purchased_regrowth}</TableCell>
          <TableCell>{loading ? "-" : stopped.purchased_percentage_of_reduction + "%"}</TableCell>
          <TableCell>{loading ? "-" : stopped.purchased_percentage_of_total + "%"}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
    </CardContent>
    </Card>
  )
}
