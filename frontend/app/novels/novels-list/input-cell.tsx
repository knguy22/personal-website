'use client'

import { useState, useEffect } from 'react'
import { Row, Column } from "@tanstack/react-table"
import { useSession } from 'next-auth/react'
import { NovelTable } from './novel-table-type'

interface InputCellProps<TData> {
  getValue: () => string
  row: Row<TData>
  column: Column<TData, unknown>
  table: NovelTable
}

export const InputCell: any = <TData,>({ getValue, row, column, table }: InputCellProps<TData>) => {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);
  const {data: session} = useSession();

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue])

  const onBlur = () => {
    table.options.meta.updateCell(row.index, column.id, value);
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