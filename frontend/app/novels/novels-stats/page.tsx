'use client'

import { Stats, AbbreToCountry } from "./stats.tsx";
import React, {useState, useEffect} from 'react';
import { fetch_backend } from "@/utils/fetch_backend.ts";
import Loading from "@/components/derived/Loading.tsx";
import { NovelBarChart } from "./charts.tsx";

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
  let country_dist = Object.entries(stats.country_dist)
    .map(([country, count]) => ({country: AbbreToCountry[country], count: count}));

  // make sure table ready data is sorted
  chapter_dist.sort((a, b) => {
    const [startA] = a.chapter.split('-').map(Number);
    const [startB] = b.chapter.split('-').map(Number);
    return startA - startB;
  });
  country_dist.sort((a, b) => b.count - a.count);
  
  return (
    <div className="flex flex-col items-center space-y-5">
      <div className="flex justify-center space-x-8">
        <NumberDisplay value={stats.novel_count} description="Total Novels" />
        <NumberDisplay value={stats.chapter_count} description="Total Chapters" />
        <NumberDisplay value={stats.average_rating.toPrecision(3)} description="Average Rating" />
      </div>
      <div className="flex justify-center space-x-8">
        <NumberDisplay value={stats.novels_completed} description="Novels Completed" />
        <NumberDisplay value={stats.novels_not_started} description="Novels Unstarted" />
      </div>
      <NovelBarChart 
        title="Rating Distribution" 
        chartData={rating_dist} 
        chartConfigKey="rating" 
        XAxisLabel="Rating" 
        XAxisKey="rating" 
        YAxisKey="count"/>
      <NovelBarChart 
        title="Chapter Distribution" 
        chartData={chapter_dist} 
        chartConfigKey="chapter" 
        XAxisLabel="Chapters" 
        XAxisKey="chapter" 
        YAxisKey="count"/>
      <NovelBarChart 
        title="Author Origin" 
        chartData={country_dist} 
        chartConfigKey="country" 
        XAxisLabel="Country of Origin" 
        XAxisKey="country" 
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