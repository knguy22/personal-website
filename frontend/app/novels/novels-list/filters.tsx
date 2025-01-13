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

import { Input } from "@/components/ui/input"

import { NovelEntry, Provider, Status } from "./novel-types"

const FilterType = {
  Text: "Text",
  Dropdown: "Dropdown",
} as const;
type FilterType = keyof typeof FilterType;

interface Filter {
  display: string,
  key: keyof NovelEntry,
  type: FilterType,
  cell_values?: Record<string, string>
};

const filter_config: Filter[] = [
  {display: "Title", key: "title", type: FilterType.Text},
  {display: "Country", key: "country", type: FilterType.Text},
  {display: "Tags", key: "tags", type: FilterType.Text},
  {display: "Rating", key: "rating", type: FilterType.Text},
  {display: "Status", key: "status", type: FilterType.Dropdown, cell_values: Status},
  {display: "Provider", key: "provider", type: FilterType.Dropdown, cell_values: Provider},
  {display: "Notes", key: "notes", type: FilterType.Text},
];

interface FilterListProp {
  table: TanstackTable<NovelEntry>,
}

export function FilterList({ table }: FilterListProp) {
  const [currFilter, setCurrFilter] = React.useState<Filter>(filter_config[0]);

  let inputMethod;
  switch (currFilter.type) {
    case FilterType.Text: {
      inputMethod =  
        <TextFilter
          table={table}
          placeholder={"Filter by " + currFilter.key}
          col_name={currFilter.key}
        />;
      break;
    }
    case FilterType.Dropdown: {
      inputMethod = 
        <DropdownFilter
          table={table}
          col_name={currFilter.key}
          cell_values={currFilter.cell_values!}
        />
      break;
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md p-2">
        <DropdownMenu>
          <DropdownMenuTrigger>{currFilter.display}</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>{"Filter by"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {filter_config.map((filter) => (
              <DropdownMenuItem key={filter.key} onClick={() => setCurrFilter(filter)}>{filter.display}</DropdownMenuItem>
            ))
            }
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {inputMethod}
    </div>
  )
}

interface TextFilterProps {
  table: TanstackTable<NovelEntry>,
  placeholder: string
  col_name: keyof NovelEntry
}

function TextFilter({table, placeholder, col_name}: TextFilterProps) {
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

interface DropdownFilterProps<K extends keyof NovelEntry> {
  table: TanstackTable<NovelEntry>,
  col_name: K
  cell_values: Record<string, NovelEntry[K]>
}

function DropdownFilter<K extends keyof NovelEntry>({table, col_name, cell_values}: DropdownFilterProps<K>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-full text-left">
        {(table.getColumn(col_name)?.getFilterValue() as string) ?? "Unselected"}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuSeparator />
        {
          Object.keys(cell_values).map((key) => {
            return (
              <DropdownMenuItem key={key} onClick={() => table.getColumn(col_name)?.setFilterValue(key)}>
                {cell_values[key]}
              </DropdownMenuItem>
            )
          })
        }
        <DropdownMenuItem key={null} onClick={() => table.getColumn(col_name)?.setFilterValue(null)}>
          Unselected
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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