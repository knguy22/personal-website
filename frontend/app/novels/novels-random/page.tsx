'use client'

import Loading from '@/components/derived/Loading.tsx';
import { useState, useEffect } from 'react';
import { fetch_backend } from "@/utils/fetch_backend.ts";
import { useSession } from 'next-auth/react'

import { novel_columns } from '../novels-list/table-columns';
import { NovelEntry, NovelEntryApi, api_to_entry } from '../novels-list/novel-types.ts';
import { DataTable } from '../novels-list/data-table.tsx';

export default function Page() {
  const num_rand_novels = 10;
  const {data: session} = useSession();
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState<NovelEntry[]>([]);

  // load novel stats once
  useEffect(() => {
    const fetchNovels = async () => {
      let raw_data: NovelEntryApi[] | null = await fetch_backend({path: `/api/random_novels/${num_rand_novels}`, method: "GET", body: undefined}) as NovelEntryApi[] | null;
      if (!raw_data) {
        raw_data = [];
      }
      const data: NovelEntry[] = raw_data.map(api_to_entry);
      setData(data);
      setLoading(false);
    };
    
    // only load novel stats one and with permissions
    if (!session || session?.user?.role !== 'admin' || !isLoading) {
      return;
    }

    fetchNovels();
  }, [session, isLoading]);

  if (!session) {
    return (
      <div className="text-5xl font-bold flex-col items-center text-center justify-between p-24">
        Sign in to view.
      </div>
    );
  }

  if (session?.user?.role !== 'admin') {
    return (
      <div className="text-5xl font-bold flex-col items-center text-center justify-between p-24">
        User privileges not high enough.
      </div>
    );
  }

  return (
    <div className="items-center justify-center">
      <h1 className="text-4xl text-center pb-5 font-medium">{num_rand_novels} Random Webnovels</h1>
      {isLoading 
        ? <Loading/> 
        : <DataTable columns={novel_columns} data={data} setData={setData}/>
      }
    </div>
  )
};
