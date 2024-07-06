/**
 * Table from shadcn-ui
 * A basic table that renders only data and columns
*/

"use client"

import * as React from "react"

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
 
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Button } from "../../components/ui/button"
import { Input } from "@/components/ui/input"

import { NovelEntry } from "./novel_types"
import { filterTags } from "./client-components"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  setData: React.Dispatch<React.SetStateAction<TData[]>>
}

export function DataTable<TData, TValue>({
  columns,
  data,
  setData,
}: DataTableProps<TData, TValue>) {


  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 50,
  });

  const [sorting, setSorting] = React.useState<SortingState>([])

  const [searchContent, setSearchContent] = React.useState<string>("");
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )

  const table = useReactTable({
    data,
    columns,
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
      updateData: (rowIndex: number, columnId: string, value: string) => {
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
    }
  })

  return (
    <div>
      <div className="flex items-center py-4">
        <Filter
          table={table}
          placeholder="Filter countries..."
          col_name="country"
        />

        <Filter
          table={table}
          placeholder="Filter titles..."
          col_name="title"
        />

        <Filter
          table={table}
          placeholder="Filter tags..."
          col_name="tags"
        />

        <Filter
          table={table}
          placeholder="Filter rating..."
          col_name="rating"
        />

        <Filter
          table={table}
          placeholder="Filter status..."
          col_name="status"
        />

        <Filter
          table={table}
          placeholder="Filter notes..."
          col_name="notes"
        />
      </div>

      <PaginationButton table={table} />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
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
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
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
      <PaginationButton table={table} />
    </div>
  )
}

interface FilterProps {
  table: any
  placeholder: string
  col_name: keyof NovelEntry
}

function Filter({table, placeholder, col_name}: FilterProps) {
  return (
    <div className="flex items-center space-x-2 pr-2">
      <Input
        placeholder={placeholder}
        value={(table.getColumn(col_name)?.getFilterValue() as string) ?? ""}
        onChange={(event) => {
          table.getColumn(col_name)?.setFilterValue(event.target.value);
          }
        }
        className="max-w-sm"
      />
    </div>
  )
}


interface PaginationProps {
  table: any
}

function PaginationButton({ table }: PaginationProps) {
  return (
      <div className="flex items-center justify-end space-x-2 py-4">
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
  );
}