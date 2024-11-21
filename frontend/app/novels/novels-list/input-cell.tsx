'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { CellContext } from "@tanstack/react-table";

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
    return <div className='max-h-8 max-w-44 overflow-x-auto text-nowrap'>{value}</div>
  }
  return (
    <input
      value={value}
      onChange={e => setValue(e.target.value)}
      onBlur={onBlur}
      className='h-6 w-full'
    />
  )
}