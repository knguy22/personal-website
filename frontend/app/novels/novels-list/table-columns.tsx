'use client'

import { CellContext, Column, ColumnDef, FilterFn } from "@tanstack/react-table"
import { ArrowUpDown} from "lucide-react"

import { Button } from "@/components/ui/button"
import { NovelEntry } from './novel-types';
import { InputCell, RatingInputCell } from '@/app/novels/novels-list/input-cell';

import { DateCell } from "./date-cell";
import { DropdownCell } from "./dropdown-cell";
import { RowEditor } from "./row-editor";
import { Status, str_to_status, status_to_str } from './novel-types'

declare module '@tanstack/table-core' {
  interface TableMeta<TData> {
    updateCell: (rowIndex: number, columnId: string, value: string) => void
    updateTableData: (data: TData[]) => void
  }
  interface FilterFns {
    filterTags: FilterFn<NovelEntry>
  }
}

export const novel_columns: ColumnDef<NovelEntry, string>[] = [
  {
    accessorKey: "country",
    header: ({ column }) => { return ColumnHeader({ title: "Country", column }) },
    filterFn: 'includesString',
    cell: InputCell,
  },
  {
    accessorKey: "title",
    header: ({ column }) => { return ColumnHeader({ title: "Title", column }) },
    filterFn: 'includesString',
    cell: InputCell,
  },
  {
    accessorKey: "chapter",
    header: ({ column }) => { return ColumnHeader({ title: "Chapter", column }) },
    cell: InputCell,
  },
  {
    accessorKey: "rating",
    header: ({ column }) => { return ColumnHeader({ title: "Rating", column }) },
    filterFn: 'equalsString',
    cell: RatingInputCell,
  },
  {
    accessorKey: "status",
    header: ({ column }) => { return ColumnHeader({ title: "Status", column }) },
    filterFn: 'includesString',
    cell: StatusDropdownCell,
  },
  {
    accessorKey: "tags",
    header: ({ column }) => { return ColumnHeader({ title: "Tags", column }) },
    filterFn: 'filterTags',
    cell: InputCell,
  },
  {
    accessorKey: "notes",
    header: ({ column }) => { return ColumnHeader({ title: "Notes", column }) },
    filterFn: 'includesString',
    cell: InputCell,
  },
  {
    accessorKey: "date_modified",
    header: ({ column }) => { return ColumnHeader({ title: "Date Modified", column }) },
    cell: DateCell,
  },
  {
    accessorKey: "Edit Row",
    header: () => { return <></> },
    cell: RowEditor
  }
];

function ColumnHeader( { title, column }: { title: string, column: Column<NovelEntry, string> } ) {
  return (
    <Button
      variant="link"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title}
      <ArrowUpDown className="ml-1" />
    </Button>
  )
}

function StatusDropdownCell<TData>({ getValue, row, column, table }: CellContext<TData, string>) {
  return (
    <DropdownCell
      getValue={getValue}
      row={row}
      column={column}
      table={table}
      cell_values={Status}
      value_to_str={status_to_str}
      str_to_value={str_to_status}
    />
  )
}
