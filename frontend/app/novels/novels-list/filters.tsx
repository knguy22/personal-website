import * as React from "react"
import { FilterFn, Row, Table as TanstackTable } from "@tanstack/react-table"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { NovelEntry } from "./novel-types"

interface FilterListProp {
  table: TanstackTable<NovelEntry>,
}

import { Input } from "@/components/ui/input"

export function FilterList({ table }: FilterListProp) {

  function findKeyByValue(obj: { [key: string]: keyof NovelEntry }, value: keyof NovelEntry): string | undefined {
    return Object.entries(obj).find(([, val]) => val === value)?.[0];
  }

  const filter_keys: { [key: string]: keyof NovelEntry } = {
    "Country": "country",
    "Title": "title",
    "Tags": "tags",
    "Rating": "rating",
    "Status": "status",
    "Notes": "notes",
  };

  const [dropDownVal, setDropDownVal] = React.useState<keyof NovelEntry>(filter_keys.Title);

  return (
    <div className="flex items-center space-x-2">
      <div className="border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md p-2">
        <DropdownMenu>
          {/* val to key for dropdown label */}
          <DropdownMenuTrigger>{findKeyByValue(filter_keys, dropDownVal)}</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>{"Filter by"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.keys(filter_keys).map((key) => (
              <DropdownMenuItem key={key} onClick={() => setDropDownVal(filter_keys[key])}>{key}</DropdownMenuItem>
            ))
            }
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Filter adjusted based on dropdown */}
      <Filter
        table={table}
        placeholder={"Filter by " + dropDownVal}
        col_name={dropDownVal}
      />
    </div>
  )
}

interface FilterProps {
  table: TanstackTable<NovelEntry>,
  placeholder: string
  col_name: keyof NovelEntry
}

function Filter({table, placeholder, col_name}: FilterProps) {
  return (
    <Input
      type="search"
      placeholder={placeholder}
      value={(table.getColumn(col_name)?.getFilterValue() as string) ?? ""}
      onChange={(event) => {
        table.getColumn(col_name)?.setFilterValue(event.target.value);
        }
      }
      className="w-10/12 px-2"
    />
  )
}

export const filterTags: FilterFn<NovelEntry> = (
  row: Row<NovelEntry>, 
  columnId: string, 
  filterValue: string, 
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