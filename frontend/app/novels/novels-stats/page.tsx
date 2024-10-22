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
  // convert distributions into table ready data
  let rating_dist = stats.rating_dist.map((count, index) => ({rating: index + 1, count: count}));
  let chapter_dist = Object.entries(stats.chapter_dist)
    .map(([chapter, count]) => ({chapter: chapter, count: count}));

  // make sure table ready data is sorted
  chapter_dist.sort((a, b) => {
    const [startA] = a.chapter.split('-').map(Number);
    const [startB] = b.chapter.split('-').map(Number);
    return startA - startB;
  });
  
  return (
    <div className="flex flex-col items-center space-y-5">
      <div className="flex justify-center space-x-8">
        <NumberDisplay value={stats.novel_count} description="Total Novels" />
        <NumberDisplay value={stats.chapter_count} description="Total Chapters" />
        <NumberDisplay value={stats.average_rating.toPrecision(3)} description="Average Rating" />
      </div>
      <StatChart 
        title="Rating Distribution" 
        chartData={rating_dist} 
        chartConfigKey="rating" 
        XAxisLabel="Rating" 
        XAxisKey="rating" 
        YAxisKey="count"/>
      <StatChart 
        title="Chapter Distribution" 
        chartData={chapter_dist} 
        chartConfigKey="chapter" 
        XAxisLabel="Chapters" 
        XAxisKey="chapter" 
        YAxisKey="count"/>
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
  chapter: {
    label: "chapter",
    color: "#4e3196",
  },
} satisfies ChartConfig

interface StatChartProps {
  title: string
  chartData: any[]
  chartConfigKey: keyof typeof chartConfig
  XAxisLabel: string,
  XAxisKey: string,
  YAxisKey: string,
}
 
function StatChart( {title, chartData, chartConfigKey, XAxisLabel, XAxisKey, YAxisKey}: StatChartProps) {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="text-xl text-center font-bold">{title}</div>
      <ChartContainer config={chartConfig} className="h-56 w-1/2">
        <BarChart accessibilityLayer data={chartData} margin={{ top: 20, bottom: 20, left: 0, right: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey={XAxisKey} tickLine={false}>
            <Label value={XAxisLabel} offset={-10} position="bottom"/>
          </XAxis>
          <YAxis></YAxis>
          <Bar dataKey={YAxisKey} fill={"var(--color-" + chartConfigKey + ")"} radius={4}>
            <LabelList dataKey={YAxisKey} position="top" />
        </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  )
}
