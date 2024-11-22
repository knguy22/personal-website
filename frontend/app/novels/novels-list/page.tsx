'use client'

import React, { useState } from 'react';
import Loading from '@/components/derived/Loading.tsx';
import { NovelEntry } from './novel-types.ts';
import { TableDropdown } from './table-dropdown.tsx';
import { novel_columns } from './table-columns.tsx';
import { DataTable } from './data-table.tsx';

export default function Page() {
  const [isLoading, setLoading] = useState(true);
  const [novels, setNovels] = useState<NovelEntry[]>([]);

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
