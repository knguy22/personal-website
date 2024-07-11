'use client'

import React, {useState, useEffect} from 'react';
import { NovelEntry, parse_novels } from './novel-types.tsx';
import { novel_columns } from './client-components.tsx';
import { DataTable } from '@/app/novels/data-table.tsx';

export default function Novels() {
  const [isLoading, setLoading] = useState(true);
  const [novels, setNovels] = useState<NovelEntry[]>([]);

  // load raw novels once
  useEffect(() => {
    const fetchNovels = async () => {
      const novels_url = process.env.NEXT_PUBLIC_API_URL + '/novels';
      try {
        const response = await fetch(novels_url);
        const novelsData = await response.json();
        console.log("Loaded novels: " + novelsData.length);
        console.log("cols: " + Object.keys(novelsData[0]));
        const convertedNovels = parse_novels(novelsData);

        // sort novels by rating by default
        convertedNovels.sort((a, b) => {
            const aIsNumeric = !isNaN(a.rating as any);
            const bIsNumeric = !isNaN(b.rating as any);
            
            // If both are numeric, compare them as numbers
            if (aIsNumeric && bIsNumeric) {
                return parseInt(b.rating) - parseInt(a.rating);
            }
            
            // If one is numeric and the other is not, the numeric one should come first
            if (aIsNumeric) return -1;
            if (bIsNumeric) return 1;
            
            // If neither are numeric, compare them as strings
            return a.rating.localeCompare(b.rating);
        });

        setNovels(convertedNovels);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchNovels();
  }, []);

  if (isLoading) {
    return (
      <div className="text-5xl font-bold flex-col items-center text-center justify-between p-24">
        Loading...
      </div>
    );

  }
  return (
    <>
      <h1 className="text-4xl text-center pb-5 font-medium">My Webnovels List</h1>
      <DataTable columns={novel_columns} data={novels} setData={setNovels}/>
    </>
  );
};
