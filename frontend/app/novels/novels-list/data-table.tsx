'use client'

import { useState } from 'react'
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
import { DownloadJsonButton } from "./download-json-button"
import { UploadBackupDialog } from "./upload-backup"

import { NovelEntry } from "./novel-types"

export interface Pagination {
  pageIndex: number,
  pageSize: number,
}

interface DataTableProps {
  columns: ColumnDef<NovelEntry, string>[]
  data: NovelEntry[]
  setData: React.Dispatch<React.SetStateAction<NovelEntry[]>>
}

export function DataTable ({
  columns,
  data,
  setData,
}: DataTableProps) {

  const [pagination, setPagination] = useState<Pagination>({
    pageIndex: 0,
    pageSize: 50,
  });

  const [sorting, setSorting] = useState<SortingState>([]);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  );

  const table = useReactTable({
    data: data,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: (newSorting) => {
      table.resetPageIndex();
      setSorting(newSorting);
    },
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onColumnFiltersChange: (newFilters) => {
      table.resetPageIndex();
      setColumnFilters(newFilters);
    },
    getFilteredRowModel: getFilteredRowModel(),
    autoResetPageIndex: false, // it's annoying to reset whenever deleting a novel
    filterFns: {
      filterTags,
    },
    state: {
      pagination,
      sorting,
      columnFilters,
      columnVisibility: {
        country: false,
        tags: false,
        notes: false,
        provider: false,
      }
    },
    meta: {
      updateCell: <K extends keyof NovelEntry,>(rowIndex: number, columnId: K, value: NovelEntry[K]) => {
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
  });

  return (
    <div className="pb-10">
      <TableOptionsRow table={table} tableData={data} setTableData={setData}/>
      <div className="rounded-md border">
        <Table>
          <DataTableHeader table={table} />
          <DataTableBody table={table} columns={columns} pagination={pagination} />
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
    <div className="flex items-center justify-between text-md">
      <FilterList table={table}/>
      <div className="hidden sm:flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2 py-4">
        <DownloadJsonButton tableData={tableData}/>
        {session?.user?.role === 'admin' ?  <UploadBackupDialog/> : null }
      </div>
      <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2 py-4">
        {session?.user?.role === 'admin' ?  <CreateNovelButton table={table} tableData={tableData} setTableData={setTableData}/> : null }
        <Button
          variant="outline"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

interface DataTableHeaderProps {
  table: TanstackTable<NovelEntry>
}

function DataTableHeader({ table }: DataTableHeaderProps) {
  return (
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
  )
}

interface DataTableBodyProps {
  table: TanstackTable<NovelEntry>
  columns: ColumnDef<NovelEntry, string>[]
  pagination: Pagination
}

function DataTableBody({ table, columns, pagination }: DataTableBodyProps) {
  // only render rows if there is data to render
  if (table.getRowModel().rows.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={columns.length + 1} className="h-24 text-center">
            No results.
          </TableCell>
        </TableRow>
      </TableBody>
    )
  }

  return (
    <TableBody>
      {table.getRowModel().rows.map((row, index) => (
        <TableRow
          key={row.id}
          data-state={row.getIsSelected() && "selected"}
        >
          {/* Number each row starting from 1 */}
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
      }
    </TableBody>
  )
}
