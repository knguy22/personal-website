'use client';
import React, {useState, useEffect} from 'react';
import { NovelEntry, parse_novels, process_tags } from './novel_types.tsx';
import { novel_columns } from './client-components.tsx';
import { DataTable } from '@/app/novels/data-table.tsx';
import "./local.css"

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
        console.log(JSON.stringify(novelsData[0]));
        const convertedNovels = parse_novels(novelsData);
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
    return (<p>Loading...</p>);
  }
  return (
    <>
      <DataTable columns={novel_columns} data={novels} setData={setNovels}/>
    </>
  );
};
