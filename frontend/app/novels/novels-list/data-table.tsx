'use client'

import * as React from "react"
import { useSession } from 'next-auth/react'

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { Table as TanstackTable } from "@tanstack/react-table"
 
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Button } from "../../../components/ui/button"

import { FilterList, filterTags } from './filters'
import { CreateNovelButton } from './create-novel-button'
import { DownloadCsvButton } from "./download-csv-button"
import { DeleteRowButton } from "./delete-row-button"

import { NovelEntry } from "./novel-types"

type NovelEntryValue = string;

interface DataTableProps {
  columns: ColumnDef<NovelEntry, NovelEntryValue>[]
  data: NovelEntry[]
  setData: React.Dispatch<React.SetStateAction<NovelEntry[]>>
}

export function DataTable ({
  columns,
  data,
  setData,
}: DataTableProps) {

  // additional functionality (delete row) that requires admin permissions
  const {data: session} = useSession();
  const columns_with_buttons: ColumnDef<NovelEntry, NovelEntryValue>[] = 
    session?.user?.role !== 'admin' ? columns : 
    [...columns, {
      accessorKey: "delete_row",
      header: ({}) => { return ""; },
      cell: DeleteRowButton
    }];


  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 50,
  });

  const [sorting, setSorting] = React.useState<SortingState>([])

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )

  const table = useReactTable({
    data: data,
    columns: columns_with_buttons,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    filterFns: {
      filterTags,
    },
    state: {
      pagination,
      sorting,
      columnFilters,
    },
    meta: {
      updateCell: (rowIndex: number, columnId: string, value: string | Date) => {
        setData((old) =>
          old.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...old[rowIndex],
                [columnId]: value,
              };
            }
            return row;
          })
        );
      },
      updateTableData: (data: NovelEntry[]) => {
        setData(data);
      }
    }
  })

  return (
    <div className="pb-10">
      <TableOptionsRow table={table} tableData={data} setTableData={setData}/>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                <TableHead key="#" className="font-semibold">
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
                    {index + 1 + pagination.pageSize * pagination.pageIndex}
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

interface TableOptionsRowProps {
  table: TanstackTable<NovelEntry>,
  tableData: NovelEntry[],
  setTableData: React.Dispatch<React.SetStateAction<NovelEntry[]>>,
}

function TableOptionsRow({ table, tableData, setTableData }: TableOptionsRowProps) {

  const {data: session} = useSession();

  return (
    <div className="flex items-center justify-between">
      <FilterList table={table}/>
      <div className="space-x-2 py-4">
        <DownloadCsvButton tableData={tableData}/>
        {/* only allow admins to create new novels */}
        {session?.user?.role === 'admin' ? 
          <CreateNovelButton table={table} tableData={tableData} setTableData={setTableData}/>
          : null
        }
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
