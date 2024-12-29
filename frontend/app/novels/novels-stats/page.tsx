'use client'

import { Stats, AbbreToCountry } from "./stats";
import React, {useState, useEffect} from 'react';
import { fetch_backend } from "@/utils/fetch_backend.ts";
import Loading from "@/components/derived/Loading.tsx";
import { NovelBarChart } from "./charts.tsx";
import PageHeader from "@/components/derived/PageHeader.tsx";

export default function Page() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setLoading] = useState(true);

  // load novel stats once
  useEffect(() => {
    const fetchStats = async () => {
      const res = await fetch_backend({path: "/api/novels_stats", method: "GET"});
      if (!res.error) {
        setStats(res.data as Stats);
      }
      setLoading(false);
    };

    fetchStats();
  }, [setStats, setLoading]);

  // handle loading and errors
  let body = <Loading/>;
  if (!isLoading) {
    if (stats === null) {
      body = <h2 className="text-center text-2xl">Failed to load stats</h2>;
    } else {
      body = <StatsTable stats={stats} />;
    }
  }

  return (
    <>
      <PageHeader>My Webnovel Stats</PageHeader>
      {body}
    </>
  );
}

function StatsTable({stats}: {stats: Stats}) {
  // convert distributions into table ready data
  const rating_dist = stats.rating_dist.map((count, index) => ({rating: index + 1, count: count}));
  const status_dist = Object.entries(stats.status_dist)
    .map(([status, count]) => ({status: status, count: count}));
  const chapter_dist = Object.entries(stats.chapter_dist)
    .map(([chapter, count]) => ({chapter: chapter, count: count}));

  const country_dist = Object.entries(stats.country_dist)
    .filter((d) => (d[0] in AbbreToCountry))
    .map(([country, count]) => ({country: AbbreToCountry[country], count: count}));
  const other_country_count = Object.entries(stats.country_dist)
    .filter((d) => !(d[0] in AbbreToCountry))
    .reduce((a, b) => a + b[1], 0);
  country_dist.push({country: "Other", count: other_country_count});

  // make sure table ready data is sorted
  status_dist.sort((a, b) => b.count - a.count);
  chapter_dist.sort((a, b) => parseInt(a.chapter) - parseInt(b.chapter));
  country_dist.sort((a, b) => b.count - a.count);

  return (
    <div className="flex flex-col items-center space-y-5 pb-5 overflow-auto">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <NumberDisplay value={stats.novel_count} description="Total Novels" />
        <NumberDisplay value={stats.chapter_count} description="Total Chapters" />
        <NumberDisplay value={stats.average_rating.toPrecision(3)} description="Average Rating" />
        <NumberDisplay value={stats.status_dist["Completed"]} description="Novels Completed" />
        <NumberDisplay value={stats.volumes_completed} description="Volumes Completed" />
        <NumberDisplay value={stats.novels_not_started} description="Novels Unstarted" />
      </div>
      <NovelBarChart 
        title="Rating Distribution" 
        chartData={rating_dist} 
        chartConfigKey="rating" 
        XAxisKey="rating" 
        YAxisKey="count"/>
      <NovelBarChart 
        title="Reading Status Distribution" 
        chartData={status_dist} 
        chartConfigKey="status" 
        XAxisKey="status" 
        YAxisKey="count"/>
      <NovelBarChart 
        title="Chapter Distribution" 
        chartData={chapter_dist} 
        chartConfigKey="chapter" 
        XAxisKey="chapter" 
        YAxisKey="count"/>
      <NovelBarChart 
        title="Author Origin" 
        chartData={country_dist} 
        chartConfigKey="country" 
        XAxisKey="country" 
        YAxisKey="count"/>
    </div>
  );
}

// returns a div with the number being large, while the category name is small and placed right below
function NumberDisplay({value, description}: {value: number | string, description: string}) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm">{description}</div>
    </div>
  )
}