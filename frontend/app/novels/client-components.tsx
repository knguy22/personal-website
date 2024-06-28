'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils.ts';
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Row, Column, Table } from "@tanstack/react-table";
import { NovelEntry, novel_entries_equal, process_tags, update_backend_novel } from './novel_types';
import { InputCell } from '@/components/ui/input-cell';

export const novel_columns: ColumnDef<NovelEntry>[] = [
  {
    accessorKey: "country",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Country
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    filterFn: 'includesString',
    cell: InputCell,
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    filterFn: 'includesString',
    cell: InputCell,
  },
  {
    accessorKey: "chapter",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Chapter
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: InputCell,
  },
  {
    accessorKey: "rating",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Rating
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    filterFn: 'equalsString',
    cell: InputCell,
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    filterFn: 'includesString',
    cell: InputCell,
  },
  {
    accessorKey: "tags",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tags
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    filterFn: 'includesString',
    cell: InputCell,
  },
  {
    accessorKey: "notes",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Notes
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    filterFn: 'includesString',
    cell: InputCell,
  },
  {
    accessorKey: "date_modified",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date Modified
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: DateCell,
  },
]

// "any" used to be compatible with tanstack table
function DateCell ({ getValue, row, c, t } : any) {
  // logic
  const initialValue = new Date(getValue());
  const [date, setDate] = useState(initialValue);
  const [row_copy, setRowCopy] = useState(row);

  useEffect(() => {
    const copy: NovelEntry = row_copy['original'];
    const incoming: NovelEntry = row['original'];

    // filtering or sorting can assign a row with a different key to the current row
    if (copy.title != incoming.title) {
      setDate(date);
      return;
    }

    // if the row has the same key, check for changes
    if (novel_entries_equal(row['original'], row_copy['original'])) {
      setDate(date);
      setRowCopy(row_copy);
    }
    else {
      setDate(new Date);
      setRowCopy(row);
      // fetch(process.env.NEXT_PUBLIC_API_URL + '/update_novel', {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(row_copy['original']),
      // })
    }
  }, [row, row_copy, date]);

  return date.toISOString();
}

export const filterNovelEntry = (
  row: Row<NovelEntry>,
  columnId: string,
  value: string
) => {
  // split the search content into individual terms
  const search_terms: String[] = value.split(",").filter((content) => content.length > 0);
  const novel: NovelEntry = row.getValue("original");

  // filter the novel
  for (const search_term of search_terms) {
    const tags = process_tags(novel.tags);

    // if the tags include the term:
    if (tags.some((tag) => tag.toLowerCase().includes(search_term.toLowerCase()))) {
      return true;
    }

    // if the title includes the term:
    if (novel.title.toLowerCase().includes(search_term.toLowerCase())) {
      return true;
    }

    // if the notes include the term:
    if (novel.notes.toLowerCase().includes(search_term.toLowerCase())) {
      return true;
    }
  }

    return false;
}

interface SearchBarProps {
  setContent: React.Dispatch<React.SetStateAction<string>>,
}

export function SearchBar({setContent}: SearchBarProps) {
  return (
    <input 
      type="text" 
      placeholder="Search By Params"
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        "max-w-sm"
      )}
      onChange={(e) => setContent(e.target.value)}
    />
  );
}