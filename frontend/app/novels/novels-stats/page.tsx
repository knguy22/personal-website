'use client'

import { Stats } from "./stats.tsx";
import React, {useState, useEffect} from 'react';
import { fetch_backend } from "@/utils/fetch_backend.ts";
import Loading from "@/components/derived/Loading.tsx";
import { Bar, BarChart, CartesianGrid, Label, LabelList, XAxis, YAxis} from "recharts"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"

export default function Page() {
  const [stats, setStats] = useState<Stats>();

  // load novel stats once
  useEffect(() => {
    const fetchStats = async () => {
      const data = await fetch_backend({path: "/api/novels_stats", method: "GET", body: undefined});
      setStats(data);
    };

    fetchStats();
  }, [])

  return (
    <>
      <h1 className="text-4xl text-center pb-5 font-medium">My Webnovel Stats</h1>
      {stats ? 
        <StatsTable stats={stats} /> 
        : <Loading/>
      }
    </>
  );
}

function StatsTable({stats}: {stats: Stats}) {
  let rating_dist_map = stats.rating_dist.map((count, index) => ({rating: index + 1, count: count}));

  return (
    <div className="flex flex-col items-center space-y-5">
      <div className="flex justify-center space-x-8">
        <NumberDisplay value={stats.novel_count} description="Total Novels" />
        <NumberDisplay value={stats.chapter_count} description="Total Chapters" />
        <NumberDisplay value={stats.average_rating.toPrecision(3)} description="Average Rating" />
      </div>
      <RatingChart chartData={rating_dist_map} chartConfig={chartConfig}/>
    </div>
  );
}

// returns a div with the number being large, while the category name is small and placed right below
function NumberDisplay({value, description}: {value: number | string, description: string}) {
  return (
    <div className="flex flex-col items-center space-x-2">
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm">{description}</div>
    </div>
  )
}

const chartConfig = {
  rating: {
    label: "rating",
    color: "#4e3196",
  },
} satisfies ChartConfig
 
export function RatingChart( {chartData, chartConfig}: {chartData: any, chartConfig: ChartConfig}) {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="text-xl text-center font-bold">Rating Distribution</div>
      <ChartContainer config={chartConfig} className="h-56 w-1/4">
        <BarChart accessibilityLayer data={chartData} margin={{ top: 20, bottom: 20, left: 0, right: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="rating" tickLine={false}>
            <Label value="Rating" offset={-10} position="bottom"/>
          </XAxis>
          <YAxis></YAxis>
          <Bar dataKey="count" fill="var(--color-rating)" radius={4}>
            <LabelList dataKey="count" position="top" /> {/* Labels on top of bars */}
        </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  )
}
