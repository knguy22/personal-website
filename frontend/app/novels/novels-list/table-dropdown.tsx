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
import { fetch_backend } from "@/utils/fetch_backend"
import { NovelEntry, NovelEntryApi, api_to_entry } from "./novel-types"

const num_rand_novels = 10;
const table_dropdown_config: {label: string, backendEndpoint: string}[] = [
  {
    label: "Novel Table",
    backendEndpoint: "/api/novels",
  },
  {
    label: "Random Novels",
    backendEndpoint: `/api/random_novels/${num_rand_novels}`,
  }
]

interface TableDropdownProps {
  setNovels: (novels: NovelEntry[]) => void;
  setLoading: (loading: boolean) => void;
}

export function TableDropdown({ setNovels, setLoading } : TableDropdownProps) {
  // by default just load the entire novel list
  useEffect(() => {
    fetch_table_data({ 
      label: table_dropdown_config[0].label, 
      backendEndpoint: table_dropdown_config[0].backendEndpoint, 
      setLoading,
      setNovels,
      setValue});
  }, [])

  const [value, setValue] = useState(table_dropdown_config[0].label);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>{value}</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{"Current Table"}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {
          table_dropdown_config.map(({label, backendEndpoint}) => {
            return (
              <DropdownMenuItem key={label} onClick={() => fetch_table_data({ label, backendEndpoint, setLoading, setNovels, setValue })}>
                {label}
              </DropdownMenuItem>
            )
          })
        }
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface fetch_table_data_props {
  label: string
  backendEndpoint: string,
  setLoading: (loading: boolean) => void,
  setNovels: (novels: NovelEntry[]) => void,
  setValue: (value: string) => void
}

async function fetch_table_data( { label, backendEndpoint, setLoading, setNovels, setValue }: fetch_table_data_props) {
  setLoading(true);
  const novels: NovelEntryApi[] | null = await fetch_backend({path: backendEndpoint, method: "GET", body: undefined}) as NovelEntryApi[] | null
  if (!novels) {
    setLoading(false);
    return null;
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

  setValue(label);
  setNovels(convertedNovels);
  setLoading(false);
}

const isNumeric = (num: unknown) => (typeof(num) === 'number' || typeof(num) === "string" && num.trim() !== '') && !isNaN(num as number);