'use client'

import React, {useState, useEffect} from 'react';
import { NovelEntry, parse_novels } from './novel-types.tsx';
import { novel_columns } from './table-columns.tsx';
import { DataTable } from '@/app/novels/novels-list/data-table.tsx';
import Loading from '@/components/derived/Loading.tsx';
import { useSession } from 'next-auth/react'
import { fetch_backend } from '@/utils/fetch_backend.ts';

const isNumeric = (num: any) => (typeof(num) === 'number' || typeof(num) === "string" && num.trim() !== '') && !isNaN(num as number);

export default function Page() {
  const [isLoading, setLoading] = useState(true);
  const [novels, setNovels] = useState<NovelEntry[]>([]);
  const {data: session} = useSession();

  // load raw novels once
  useEffect(() => {
    const fetchNovels = async () => {
      try {
        const novelsData = await fetch_backend({path: "/api/novels", method: "GET", body: undefined});
        const convertedNovels = parse_novels(novelsData);

        // sort novels by rating by default
        convertedNovels.sort((a, b) => {
            const aIsNumeric = isNumeric(a.rating);
            const bIsNumeric = isNumeric(b.rating);

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
      <h1 className="text-4xl text-center pb-5 font-medium">My Webnovels List</h1>
      {isLoading
        ? <Loading />
        : <DataTable columns={novel_columns} data={novels} setData={setNovels} />
      }
    </div>
  );
};
