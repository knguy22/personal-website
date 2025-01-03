/* 
TableDropdown handles which table is loaded and allows for easy switching between different novels.

Currently, two tables are supported:
1. Novel Table
2. Random Novels
*/

'use client'

import { useEffect, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { fetch_backend } from "@/lib/fetch_backend"
import { NovelEntry, NovelEntryApi, api_to_entry } from "./novel-types"
import PageHeader from "@/components/derived/PageHeader"

type DropdownConfig = {
  label: string;
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  body: BodyInit
}

const num_rand_novels = 10;
const table_dropdown_config: DropdownConfig[] = [
  {
    label: "My Webnovels List",
    path: "/api/novels",
    method: "GET",
    body: JSON.stringify(undefined),
  },
  {
    label: `${num_rand_novels} Random Novels`,
    path: `/api/random_novels`,
    method: "POST",
    body: JSON.stringify(num_rand_novels),
  }
]

interface TableDropdownProps {
  setNovels: (novels: NovelEntry[]) => void;
  setLoading: (loading: boolean) => void;
}

export function TableDropdown({ setNovels, setLoading } : TableDropdownProps) {
  const [value, setValue] = useState(table_dropdown_config[0].label);

  // by default just load the entire novel list
  useEffect(() => {
    fetch_table_data({ 
      dropdown: table_dropdown_config[0],
      setLoading,
      setNovels,
      setValue});
  }, [setLoading, setNovels, setValue]);

  return (
    <PageHeader>
      <DropdownMenu>
        <DropdownMenuTrigger 
          className="border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md p-4">
            {value}
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>{"Current Table"}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {
            table_dropdown_config.map((dropdown) => {
              return (
                <DropdownMenuItem key={dropdown.label} onClick={() => fetch_table_data({ dropdown, setLoading, setNovels, setValue })}>
                  {dropdown.label}
                </DropdownMenuItem>
              )
            })
          }
        </DropdownMenuContent>
      </DropdownMenu>
    </PageHeader>
  )
}

interface fetch_table_data_props {
  dropdown: DropdownConfig,
  setLoading: (loading: boolean) => void,
  setNovels: (novels: NovelEntry[]) => void,
  setValue: (value: string) => void
}

async function fetch_table_data( { dropdown, setLoading, setNovels, setValue }: fetch_table_data_props) {
  setLoading(true);
  let res = await fetch_backend(
    {path: dropdown.path, method: dropdown.method, body: dropdown.body, contentType: "application/json"}
  );

  let novels = res.data as NovelEntryApi[] | null;
  if (!novels) {
    novels = [];
  }

  const convertedNovels: NovelEntry[] = novels.map(api_to_entry);

  // sort novels by rating by default
  convertedNovels.sort((a, b) => {
    const aIsNumeric = isNumeric(a.rating);
    const bIsNumeric = isNumeric(b.rating);

    // If both are numeric, compare them as numbers
    if (aIsNumeric && bIsNumeric) {
        return parseInt(b.rating) - parseInt(a.rating);
    }
    
    // If one is numeric and the other is not, the numeric one should come first
    if (aIsNumeric) return -1;
    if (bIsNumeric) return 1;
    
    // If neither are numeric, compare them as strings
    return a.rating.localeCompare(b.rating);
  });

  setValue(dropdown.label);
  setNovels(convertedNovels);
  setLoading(false);
}

const isNumeric = (num: unknown) => (typeof(num) === 'number' || typeof(num) === "string" && num.trim() !== '') && !isNaN(num as number);