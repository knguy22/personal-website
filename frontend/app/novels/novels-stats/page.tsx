'use client'

import { Stats } from "./stats.tsx";
import React, {useState, useEffect} from 'react';

export default function Page() {
  const [stats, setStats] = useState<Stats>();

  // load novel stats once
  useEffect(() => {
    const fetchStats = async () => {
      const url = process.env.NEXT_PUBLIC_API_URL + '/novels_stats';
      try {
        const response = await fetch(url);
        const data: Stats = await response.json();
        setStats(data);
      } catch (error) {
        console.log(error);
      } 
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