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
  TableOptions,
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

  // additional functionality that requires setData
  const columns_with_buttons: ColumnDef<TData, TValue>[] = [...columns, {
    accessorKey: "delete_row",
    header: ({}) => { return ""; },
    cell: ({ _getValue, row, _cell, table } : any) => {
      function delete_row() {
        const id_to_delete = row.original.id;

        // delete from backend first
        const frontend_api_url = process.env.NEXT_PUBLIC_API_URL + '/delete_novel';
        const backend_status = fetch(frontend_api_url, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: id_to_delete,
        }).catch((error) => {
          console.log("Fetch api error: " + error)
          return;
        });

        // tanstack uses it's own id, this is not the id in the backend
        const tanstack_id_rows: any = table.getPreFilteredRowModel().flatRows;
        let data: TData[] = new Array();
        for (const tanstack_id in tanstack_id_rows) {
          const novel_id = tanstack_id_rows[tanstack_id].original.id;
          if (novel_id !== id_to_delete) {
            data.push(tanstack_id_rows[tanstack_id].original);
          }
        }

        setData(data);
      }

      return (
        <Button
          variant="secondary"
          size={"sm"}
          onClick={() => delete_row()}
          className='text-red-500'
        >
          Delete Row
        </Button>
      )
    }
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
      <FilterList table={table} />
      <TableButtons table={table} tableData={data} setTableData={setData}/>
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
      <TableButtons table={table} tableData={data} setTableData={setData}/>
    </div>
  )
}

interface FilterListProp {
  table: any
}

function FilterList ({ table }: FilterListProp) {
  return (
    <div className="flex items-center py-4">
      <Filter
        table={table}
        placeholder="Filter by countries..."
        col_name="country"
      />

      <Filter
        table={table}
        placeholder="Filter by titles..."
        col_name="title"
      />

      <Filter
        table={table}
        placeholder="Filter by tags..."
        col_name="tags"
      />

      <Filter
        table={table}
        placeholder="Filter by rating..."
        col_name="rating"
      />

      <Filter
        table={table}
        placeholder="Filter by status..."
        col_name="status"
      />

      <Filter
        table={table}
        placeholder="Filter by notes..."
        col_name="notes"
      />
    </div>
  )
}

interface FilterProps {
  table: any
  placeholder: string
  col_name: keyof NovelEntry
  class_extra?: string
}

function Filter({table, placeholder, col_name, class_extra}: FilterProps) {
  return (
    <div className="flex items-center space-x-2 pr-2">
      <Input
        placeholder={placeholder}
        value={(table.getColumn(col_name)?.getFilterValue() as string) ?? ""}
        onChange={(event) => {
          table.getColumn(col_name)?.setFilterValue(event.target.value);
          }
        }
        className={"max-w-sm" + (class_extra ? " " + class_extra : "")}
      />
    </div>
  )
}


interface TableButtonsProps<TData> {
  table: any,
  tableData: TData[],
  setTableData: React.Dispatch<React.SetStateAction<TData[]>>,
}

function TableButtons<TData>({ table, tableData, setTableData }: TableButtonsProps<TData>) {
  async function create_novel(): Promise<TData | null> {
    try {
      const response = await fetch("/api/create_novel", {
        method: "GET",
      });
      
      if (response.ok) {
        const res: TData = await response.json();
        return res;
      } else {
        const errorText = await response.text();
        throw new Error(errorText);
      }
    } catch (error) {
      console.error("Error fetching novel:", error);
    }

    return null;
  }

  return (
    <div className="flex items-center justify-end space-x-2 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          create_novel().then((novel) => {
            if (!novel) {
              return;
            }
            let tableDataCopy = [...tableData];
            tableDataCopy.push(novel);
            console.log("Table data: " + tableDataCopy.length);
            setTableData(tableDataCopy)
          })
          
        }}
      >
        New Row
      </Button>
      
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