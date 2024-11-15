'use client'

import React from 'react';
import { NovelEntry } from '../novels-list/novel-types';
import { filterTags } from '../novels-list/data-table';

import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"


type NovelEntryValue = string;

interface DataTableProps {
  columns: ColumnDef<NovelEntry, NovelEntryValue>[]
  data: NovelEntry[]
}

export function DataTable ({
  columns,
  data,
}: DataTableProps) {

  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useReactTable({
    data: data,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    filterFns: { filterTags, },
    state: {
      sorting,
    }
  })

  return (
    <div className="pb-10">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                <TableHead key="#">
                  #
                </TableHead>

                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  <TableCell>
                    {index + 1}
                  </TableCell>

                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

interface TextCell<TData> {
  getValue: () => string
}

const TextCell: any = <TData,>({ getValue }: TextCell<TData>) => {
  return <div className='max-h-8 max-w-44 overflow-x-auto text-nowrap'>{getValue()}</div>
}