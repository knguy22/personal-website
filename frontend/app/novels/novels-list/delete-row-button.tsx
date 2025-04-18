import * as React from "react"

import { Row, Table } from "@tanstack/react-table"
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
import { cn } from "@/lib/utils.ts";
import { buttonVariants } from "@/components/ui/button";
import { useToast } from "@/components/hooks/use-toast"

import { fetch_backend } from "@/lib/fetch_backend.ts"
import { NovelEntry } from "./novel-types.ts"

interface DeleteRowButtonProps {
  row: Row<NovelEntry>,
  table: Table<NovelEntry>
}

export const DeleteRowButton = ({ row, table } : DeleteRowButtonProps) => {
  const {toast} = useToast();

  async function delete_row() {
    const id_to_delete: number = row.original.id;

    // delete from backend first
    const res = await fetch_backend({path: "/api/delete_novel", method: "DELETE", body: JSON.stringify(id_to_delete), contentType: "application/json"});

    // check if the delete was successful
    if (res.error) {
      toast({title: "Error deleting row..."})
      return;
    }

    // tanstack uses it's own id, this is not the id in the backend
    const tanstack_id_rows = table.getPreFilteredRowModel().flatRows;
    const data: NovelEntry[] = [];
    for (const tanstack_id in tanstack_id_rows) {
        const novel_id = tanstack_id_rows[tanstack_id].original.id;
        if (novel_id !== id_to_delete) {
            data.push(tanstack_id_rows[tanstack_id].original);
        }
    }

    table.options.meta?.updateTableData(data);
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive"
          size={"sm"}
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
          <div className="w-full grid grid-cols-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <div></div>
            <AlertDialogAction
              onClick={() => delete_row()}
              className={cn(buttonVariants({variant: "destructive"}))}
            >
              Continue
            </AlertDialogAction>
          </div>
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
