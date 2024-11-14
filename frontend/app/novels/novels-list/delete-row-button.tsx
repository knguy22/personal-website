import * as React from "react"

import { Button } from "../../../components/ui/button"
import { fetch_backend } from "@/utils/fetch_backend"
import { NovelEntry } from "./novel-types"

interface DeleteRowButtonProps {
  row: any,
  table: any,
}

export function DeleteRowButton({ row, table} : DeleteRowButtonProps) {
  return (
    <Button
      variant="secondary"
      size={"sm"}
      onClick={() => delete_row({row, table})}
      className='text-red-500'
    >
      Delete Row
    </Button>
  )
}

function delete_row({ row, table } : DeleteRowButtonProps) {
  const id_to_delete: number = row.original.id;

  // delete from backend first
  fetch_backend({path: "/api/delete_novel/" + id_to_delete.toString(), method: "DELETE", body: undefined});

  // tanstack uses it's own id, this is not the id in the backend
  const tanstack_id_rows: any = table.getPreFilteredRowModel().flatRows;
  let data: NovelEntry[] = new Array();
  for (const tanstack_id in tanstack_id_rows) {
      const novel_id = tanstack_id_rows[tanstack_id].original.id;
      if (novel_id !== id_to_delete) {
          data.push(tanstack_id_rows[tanstack_id].original);
      }
  }

  table.options.meta.updateTableData(data);
}