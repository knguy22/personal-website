import { useState, useEffect } from 'react'
import { Row, Table, Column } from "@tanstack/react-table"

interface InputCellProps<TData> {
  getValue: () => string
  row: Row<TData>
  column: Column<TData, unknown>
  table: any
}

export const InputCell: any = <TData,>({ getValue, row, column, table }: InputCellProps<TData>) => {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue])

  const onBlur = () => {
    table.options.meta?.updateData(row.index, column.id, value);
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