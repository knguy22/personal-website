'use client'

import { Column, ColumnDef, FilterFn } from "@tanstack/react-table"
import { ArrowUpDown} from "lucide-react"
import { CellContext } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { NovelEntry } from './novel-types';

import { RowEditor } from "./row-editor";

declare module '@tanstack/table-core' {
  interface TableMeta<TData> {
    updateCell: (rowIndex: number, columnId: keyof TData, value: TData[keyof TData]) => void
    updateTableData: (data: TData[]) => void
  }
  interface FilterFns {
    filterTags: FilterFn<NovelEntry>
  }
}

export const novel_columns: ColumnDef<NovelEntry, string>[] = [
  // visible columns
  {
    accessorKey: "title",
    header: ({ column }) => { return ColumnHeader({ title: "Title", column }) },
    filterFn: 'includesString',
    cell: ReadOnlyCell,
  },
  {
    accessorKey: "chapter",
    header: ({ column }) => { return ColumnHeader({ title: "Chapter", column }) },
    cell: ReadOnlyCell,
  },
  {
    accessorKey: "rating",
    header: ({ column }) => { return ColumnHeader({ title: "Rating", column }) },
    filterFn: 'equalsString',
    cell: ReadOnlyCell,
  },
  {
    accessorKey: "status",
    header: ({ column }) => { return ColumnHeader({ title: "Status", column }) },
    filterFn: 'includesString',
    cell: ReadOnlyCell,
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
  },

  // invisible columns
  {
    accessorKey: "country",
    header: ({ column }) => { return ColumnHeader({ title: "Country", column }) },
    filterFn: 'includesString',
  },
  {
    accessorKey: "provider",
    header: ({ column }) => { return ColumnHeader({ title: "Provider", column }) },
    filterFn: 'includesString',
  },
  {
    accessorKey: "tags",
    header: ({ column }) => { return ColumnHeader({ title: "Tags", column }) },
    filterFn: 'filterTags',
  },
  {
    accessorKey: "notes",
    header: ({ column }) => { return ColumnHeader({ title: "Notes", column }) },
    filterFn: 'includesString',
  },
];

function ColumnHeader( { title, column }: { title: string, column: Column<NovelEntry, string> } ) {
  return (
    <Button
      variant="link"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      size="md_no_padding"
    >
      {title}
      <ArrowUpDown className="ml-1" />
    </Button>
  )
}

function ReadOnlyCell<TData>({ getValue }: CellContext<TData, string>) {
  return <div className="text-md">{getValue()}</div>
}

function DateCell({ getValue } : CellContext<NovelEntry, string>) {
  const date = new Date(getValue());
  
  return (
    <div>
      {date.toDateString()}
      <br />
      {date.toLocaleTimeString()}
    </div>
  )
}
