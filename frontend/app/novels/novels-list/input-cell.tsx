'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { CellContext } from "@tanstack/react-table";
import { PublicCell } from './public-cell';

export const InputCell = <TData,>({ getValue, row, column, table }: CellContext<TData, string>) => {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);
  const {data: session} = useSession();

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue])

  const onBlur = () => {
    table.options.meta?.updateCell(row.index, column.id, value);
  }

  // only allow editing for admins
  if (session?.user?.role !== 'admin') {
    return <PublicCell value={value} />
  }
  return (
    <input
      value={value}
      onChange={e => setValue(e.target.value)}
      onBlur={onBlur}
      className='h-full w-full'
    />
  )
}