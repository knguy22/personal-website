'use client'

import React, {useState } from 'react';
import Loading from '@/components/derived/Loading.tsx';
import { useSession } from 'next-auth/react'
import { NovelEntry } from './novel-types.ts';
import { TableDropdown } from './table-dropdown.tsx';
import { novel_columns } from './table-columns.tsx';
import { DataTable } from './data-table.tsx';

export default function Page() {
  const [isLoading, setLoading] = useState(true);
  const [novels, setNovels] = useState<NovelEntry[]>([]);
  const {data: session} = useSession();

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
      <TableDropdown setNovels={setNovels} setLoading={setLoading} />
      {isLoading
        ? <Loading />
        : <DataTable columns={novel_columns} data={novels} setData={setNovels} />
      }
    </div>
  );
};
