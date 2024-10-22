'use client'

import { Stats } from "./stats.tsx";
import React, {useState, useEffect} from 'react';
import { fetch_backend } from "@/utils/fetch_backend.ts";
import Loading from "@/components/derived/Loading.tsx";

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
  return (
    <div className="flex justify-center space-x-8">
      <NumberDisplay value={stats.novel_count} description="Total Novels" />
      <NumberDisplay value={stats.chapter_count} description="Total Chapters" />
      <NumberDisplay value={stats.average_rating.toPrecision(3)} description="Average Rating" />
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