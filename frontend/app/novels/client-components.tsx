'use client';

import { useState, useEffect } from 'react';
import { ColumnDef, FilterFn, Row } from "@tanstack/react-table"
import { ArrowUpDown} from "lucide-react"
import { Button } from "@/components/ui/button"
import { NovelEntry, novel_entries_equal } from './novel_types';
import { InputCell } from '@/components/ui/input-cell';

declare module '@tanstack/table-core' {
  interface FilterFns {
    filterTags: FilterFn<NovelEntry>
  }
}

export const novel_columns: ColumnDef<NovelEntry>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Id
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },

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
    filterFn: 'filterTags',
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

  const [date, setDate] = useState<Date>(new Date(getValue()));
  const [row_copy, setRowCopy] = useState(row);

  useEffect(() => {
    const incoming: NovelEntry = row['original'];

    // if the row has the same key, check for changes
    if (novel_entries_equal(row['original'], row_copy['original'])) {
      setDate(date);
    } else {
      const frontend_api_url = process.env.NEXT_PUBLIC_API_URL + '/update_novel';
      const new_date = new Date();

      setDate(new_date);
      setRowCopy(row);

      // incoming doesn't have an updated date
      const to_send = { ...incoming, date_modified: new_date.toISOString() };
      fetch(frontend_api_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(to_send),
      }).catch((error) => {
        console.log("Fetch api error: " + error)
      });
    }
  }, [row, row_copy, date]);

  try {
    return date.toISOString();
  }
  catch (error) {
    return "";
  }
}

export const filterTags: FilterFn<NovelEntry> = (
  row: Row<NovelEntry>, 
  columnId: string, 
  filterValue: string, 
  addMeta: (meta: any) => void
  ): boolean => {

  const search_terms = filterValue.toLocaleLowerCase().split(",").map((term) => {
    return term.trim();
  });
  const row_value: string = row.getValue(columnId);
  const tags: string[] = row_value.toLocaleLowerCase().split(",").map((tag) => {
    return tag.trim();
  });

  // only return true if all search terms are in the tags
  for (const search_term of search_terms) {
    if (!tags.includes(search_term)) {
      return false;
    }
  }
  return true;
}