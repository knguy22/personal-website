'use client'

import { useState } from 'react'
import { Row, Column, Table } from "@tanstack/react-table"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DropdownCellProps<TData, ValueType> {
  getValue: () => string;
  row: Row<TData>;
  column: Column<TData, string>;
  table: Table<TData>;
  cell_values: { [key: string]: ValueType };
  value_to_str: (value: ValueType) => string
  str_to_value: (value: string) => ValueType
}

export function DropdownCell<TData, ValueType>({ getValue, row, column, table, cell_values, value_to_str, str_to_value }: DropdownCellProps<TData, ValueType>) {
  const [value, setValue] = useState<ValueType>(str_to_value(getValue()));

  function onChange(newValue: ValueType) {
    setValue(newValue);
    table.options.meta?.updateCell(row.index, column.id, value_to_str(newValue));
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>{value_to_str(value)}</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuSeparator />
        {
          Object.keys(cell_values).map((key) => {
            return (
              <DropdownMenuItem key={key} onClick={() => onChange(cell_values[key])}>
                {value_to_str(cell_values[key])}
              </DropdownMenuItem>
            )
          })
        }
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
