import * as React from "react"

import { Table as TanstackTable } from "@tanstack/react-table"
 
import { Button } from "../../../components/ui/button"
import { api_to_entry, NovelEntry, NovelEntryApi } from "./novel-types"
import { fetch_backend } from "@/utils/fetch_backend"

interface CreateNovelButtonProps {
  table: TanstackTable<NovelEntry>,
  tableData: NovelEntry[]
  setTableData: React.Dispatch<React.SetStateAction<NovelEntry[]>>
}

export function CreateNovelButton({ tableData, setTableData }: CreateNovelButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        create_novel().then((novel) => {
          if (!novel) {
            return;
          }
          const tableDataCopy = [...tableData];
          tableDataCopy.push(novel);
          setTableData(tableDataCopy)
        })
        
      }}
    >
      New Row
    </Button>
  )
}

async function create_novel(): Promise<NovelEntry | null> {
  const raw_novel: NovelEntryApi | null = await fetch_backend({path: "/api/create_novel", method: "GET"}) as NovelEntryApi | null;
  if (!raw_novel) {
    return null;
  }
  return api_to_entry(raw_novel);
}
