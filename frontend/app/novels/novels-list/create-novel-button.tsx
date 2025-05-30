import * as React from "react"

import { Table as TanstackTable } from "@tanstack/react-table"
 
import { Button } from "../../../components/ui/button"
import { api_to_entry, NovelEntry, NovelEntryApi } from "./novel-types"
import { fetch_backend } from "@/lib/fetch_backend"
import { useToast } from "@/components/hooks/use-toast"

interface CreateNovelButtonProps {
  table: TanstackTable<NovelEntry>,
  tableData: NovelEntry[]
  setTableData: React.Dispatch<React.SetStateAction<NovelEntry[]>>
}

export function CreateNovelButton({ tableData, setTableData }: CreateNovelButtonProps) {
  const {toast} = useToast();

  return (
    <Button
      variant="outline"
      onClick={() => {
        create_novel().then((novel) => {
          if (!novel) {
            toast({title: "Error creating novel"})
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
  const response = await fetch_backend({path: "/api/create_novel", method: "GET"});
  const raw_novel = response.data as NovelEntryApi | null;
  if (raw_novel) {
    return api_to_entry(raw_novel);
  }
  return null;
}
