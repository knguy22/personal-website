'use client'

import { useState, useEffect } from 'react'
import { Row, Column } from "@tanstack/react-table"
import { useSession } from 'next-auth/react'

interface InputCellProps<TData> {
  getValue: () => string
  row: Row<TData>
  column: Column<TData, unknown>
  table: any
}

export const InputCell: any = <TData,>({ getValue, row, column, table }: InputCellProps<TData>) => {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);
  const {data: session} = useSession();

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue])

  const onBlur = () => {
    table.options.meta?.updateData(row.index, column.id, value);
  }

  if (session?.user?.role !== 'admin') {
    return (value);
  }

  return (
    <input
      value={value}
      onChange={e => setValue(e.target.value)}
      onBlur={onBlur}
      className='w-full'
    />
  )
}