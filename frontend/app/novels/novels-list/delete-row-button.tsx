import * as React from "react"

import { Button } from "../../../components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

import { fetch_backend } from "@/utils/fetch_backend"
import { NovelEntry } from "./novel-types.ts"
import { NovelTable } from "./novel-table-type.ts";

interface DeleteRowButtonProps {
  row: {original: NovelEntry, },
  table: NovelTable
}

export const DeleteRowButton: any = ({ row, table } : DeleteRowButtonProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="secondary"
          size={"sm"}
          className='text-red-500'
        >
          Delete Row
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure? This will delete the following row:</AlertDialogTitle>
        </AlertDialogHeader>
        <VisuallyHidden.Root>
          <AlertDialogDescription></AlertDialogDescription>
        </VisuallyHidden.Root>
        {novel_to_component(row.original)}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => delete_row({row, table})}
            className='text-red-500 bg-secondary hover:bg-secondary/80'
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// parses a novel entry as a minimized component
function novel_to_component(novel: NovelEntry) {
  return (
    <div className="pt-2 text-primary">
      <div className="text-sm">Title: {novel.title}</div>
      <div className="text-sm">Chapter: {novel.chapter}</div>
      <div className="text-sm">Rating: {novel.rating}</div>
      <div className="text-sm">Status: {novel.status}</div>
      <div className="text-sm">Last Updated: {novel.date_modified.toString()}</div>
    </div>
  )
}

async function delete_row({ row, table } : DeleteRowButtonProps) {
  const id_to_delete: number = row.original.id;

  // delete from backend first
  const res = await fetch_backend({path: "/api/delete_novel/" + id_to_delete.toString(), method: "DELETE", body: undefined});

  // check if the delete was successful
  if (!res) {
    return;
  }

  // tanstack uses it's own id, this is not the id in the backend
  const tanstack_id_rows = table.getPreFilteredRowModel().flatRows;
  let data: NovelEntry[] = new Array();
  for (const tanstack_id in tanstack_id_rows) {
      const novel_id = tanstack_id_rows[tanstack_id].original.id;
      if (novel_id !== id_to_delete) {
          data.push(tanstack_id_rows[tanstack_id].original);
      }
  }

  table.options.meta.updateTableData(data);
}