'use client'

import { Column, ColumnDef, FilterFn } from "@tanstack/react-table"
import { ArrowUpDown} from "lucide-react"

import { Button } from "@/components/ui/button"
import { NovelEntry } from './novel-types';
import { ReadOnlyCell } from '@/app/novels/novels-list/read-only-cell';

import { DateCell } from "./date-cell";
import { RowEditor } from "./row-editor";

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
    cell: ReadOnlyCell,
  },
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
    accessorKey: "tags",
    header: ({ column }) => { return ColumnHeader({ title: "Tags", column }) },
    filterFn: 'filterTags',
    cell: ReadOnlyCell,
  },
  {
    accessorKey: "notes",
    header: ({ column }) => { return ColumnHeader({ title: "Notes", column }) },
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
  }
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
