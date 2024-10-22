'use client'

import { Stats } from "./stats.tsx";
import React, {useState, useEffect} from 'react';
import { fetch_backend } from "@/utils/fetch_backend.ts";

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

  // return a json
  return (
    <div>
      {JSON.stringify(stats)}
    </div>
  );
}