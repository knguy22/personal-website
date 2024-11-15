'use client'

import Loading from '@/components/derived/Loading.tsx';
import { useState, useEffect } from 'react';
import { fetch_backend } from "@/utils/fetch_backend.ts";
import { useSession } from 'next-auth/react'

import { novel_columns } from '../novels-list/table-columns';
import { NovelEntry, NovelEntryApi, api_to_entry } from '../novels-list/novel-types.ts';
import { InputCell } from '../novels-list/input-cell.tsx';

import { DataTable } from './data-table.tsx';

export default function Page() {
  const {data: session} = useSession();
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState<NovelEntry[]>([]);

  // columns allow editing, which is something we don't want
  // replace InputCell with TextCell
  const columns = novel_columns.map((column) => {
    if (column.cell === InputCell) {
      return {
        ...column,
        cell: TextCell,
      }
    }
    return column
  })

  // load novel stats once
  useEffect(() => {
    const fetchNovels = async () => {
      const raw_data: NovelEntryApi[] = await fetch_backend({path: "/api/random_novels/10", method: "GET", body: undefined});
      const data: NovelEntry[] = raw_data.map(api_to_entry);
      setData(data);
      setLoading(false);
    };

    fetchNovels();
  }, [])

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
    isLoading ? <Loading/> :
    <DataTable columns={columns} data={data} />
  )
};

interface TextCell<TData> {
  getValue: () => string
}

const TextCell: any = <TData,>({ getValue }: TextCell<TData>) => {
  return <div className='max-h-12 max-w-44 overflow-x-auto text-nowrap'>{getValue()}</div>
}
