import * as React from "react"

import { Table as TanstackTable } from "@tanstack/react-table"
 
import { Button } from "../../../components/ui/button"
import { NovelEntry } from "./novel-types"
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
          let tableDataCopy = [...tableData];
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
  const raw_novel = await fetch_backend({path: "/api/create_novel", method: "GET", body: undefined});
  if (!raw_novel) {
    return null;
  }
  const novel: NovelEntry = {
    id: raw_novel.id,
    country: raw_novel.country,
    title: raw_novel.title,
    chapter: raw_novel.chapter,
    rating: raw_novel.rating !== 0 ? String(raw_novel.rating) : "",
    status: raw_novel.status,
    tags: raw_novel.tags.join(","),
    notes: raw_novel.notes,
    date_modified: raw_novel.date_modified
  }
  return novel;
}
