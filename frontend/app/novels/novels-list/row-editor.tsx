"use client"

import { useState } from "react"
import { useSession } from 'next-auth/react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button"
import { Bordered } from "@/components/derived/Bordered"
import { useToast } from "@/components/hooks/use-toast"

import { CellContext } from "@tanstack/react-table"
import { Provider, Status, NovelEntry, NovelEntryApi, api_to_entry, entry_to_api, novel_entries_equal, novel_col_names } from "./novel-types"
import { DeleteRowButton } from "./delete-row-button"
import { fetch_backend } from "@/lib/fetch_backend"

const modified: string = "bg-secondary text-secondary-foreground";

interface NovelDiffs {
  orig_novel: NovelEntry
  novel: NovelEntry
  setNovel: (novel: NovelEntry) => void
}

export function RowEditor({ row, table }: CellContext<NovelEntry, string>) {
  const [novel, setNovel] = useState<NovelEntry>(row.original)
  const {data: session} = useSession();
  const {toast} = useToast();
  const date_modified = new Date(row.original.date_modified);
  const can_update = !novel_entries_equal(novel, row.original);

  const novel_diffs: NovelDiffs = {
    orig_novel: row.original,
    novel,
    setNovel,
  }

  async function update_novel(novel: NovelEntry) {
    if (!can_update) {
      return;
    }

    // try to update backend
    const result = await update_row(novel);
    if (!result) {
      toast({title: "Error updating novel"});
      return;
    }

    // if success, update locally
    for (const key of novel_col_names) {
      table.options.meta?.updateCell(row.index, key, result[key]);
    }
  }

  const dialog_buttons = session?.user?.role === "admin" ?
    <div className="grid grid-cols-3 pt-3">
      <DeleteRowButton row={row} table={table} />
      <div></div>
      <Button size="sm" variant="default" disabled={!can_update} onClick={() => update_novel(novel)}>Save</Button>
    </div> :
    null
  ;

  return (
    <Dialog onOpenChange={() => setNovel(row.original)}>
      <DialogTrigger className={cn(buttonVariants({ variant: "outline", size: "sm", className: "" }))}>
        {session?.user?.role === "admin" ? "Open Row Editor" : "View Details"}
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">{novel.title}</DialogTitle>
          <DialogDescription/>
        </DialogHeader>
        <div className="p-1 grid grid-cols-6 gap-x-4 gap-y-3">
          <div className="col-span-6">
            <EditorInput column_id="title" display_name="Title" novel_diffs={novel_diffs}/>
          </div>
          <EditorInput column_id="country" display_name="Country" novel_diffs={novel_diffs} />
          <EditorInput column_id="chapter" display_name="Chapter" novel_diffs={novel_diffs} />
          <RatingEditorInput column_id="rating" display_name="Rating" novel_diffs={novel_diffs} />
          <DropdownInput column_id="status" display_name="Status" novel_diffs={novel_diffs} cell_values={Status} />
          <DropdownInput column_id="provider" display_name="Provider" novel_diffs={novel_diffs} cell_values={Provider} />
          <div className="col-span-4 flex flex-col space-y-1">
            <div className="text-md">{"Date Modified"}</div>
            <Bordered>
              <div className="flex flex-row space-x-1">
                <div className="flex items-center">{date_modified.toDateString()}</div>
                <div className="flex items-center">{date_modified.toLocaleTimeString()}</div>
              </div>
            </Bordered>
          </div>
          <DatePicker column_id="date_started" display_name="Date Started" novel_diffs={novel_diffs} />
          <DatePicker column_id="date_completed" display_name="Date Completed" novel_diffs={novel_diffs} />
          <LargeEditorInputProps column_id="notes" display_name="Notes" novel_diffs={novel_diffs} />
          <LargeEditorInputProps column_id="tags" display_name="Tags" novel_diffs={novel_diffs} />
        </div>
        {dialog_buttons}
      </DialogContent>
    </Dialog>
  )
}

interface EditorInputProps {
  column_id: keyof NovelEntry
  display_name: string
  novel_diffs: NovelDiffs
}

function EditorInput({ column_id, display_name, novel_diffs, ...props } : EditorInputProps) {
  const {data: session} = useSession();
  const modified_css = novel_diffs.novel[column_id] === novel_diffs.orig_novel[column_id] ? "" : modified;

  return (
    <div className="col-span-2 flex flex-col space-y-1">
      <div className="text-md">{display_name}</div>
      <Input
        value={novel_diffs.novel[column_id] || ""}
        readOnly={session?.user?.role !== 'admin'}
        onChange={e => novel_diffs.setNovel({...novel_diffs.novel, [column_id]: e.target.value})}
        className={cn('w-full', modified_css)}
        {...props}
      />
    </div>
  )
}

function RatingEditorInput(props: EditorInputProps) {
  const new_props = {
    ...props,
    type: 'number',
    min: 0,
    max: 10,
    step: 1,
  }

  return (
    <EditorInput {...new_props} />
  )
}

function LargeEditorInputProps({ column_id, display_name, novel_diffs, ...props } : EditorInputProps) {
  const {data: session} = useSession();
  const modified_css = novel_diffs.novel[column_id] === novel_diffs.orig_novel[column_id] ? "" : modified;

  return (
    <div className="col-span-6 flex flex-col space-y-1">
      <div className="text-md">{display_name}</div>
      <Textarea
        value={novel_diffs.novel[column_id] || ""}
        readOnly={session?.user?.role !== 'admin'}
        onChange={e => novel_diffs.setNovel({...novel_diffs.novel, [column_id]: e.target.value})}
        rows={4}
        className={cn('w-full', modified_css)}
        {...props}
      />
    </div>
  )
}


interface DropdownInputProps<K extends keyof NovelEntry> {
  column_id: K
  display_name: string
  novel_diffs: NovelDiffs
  cell_values: Record<string, NovelEntry[K]>
}

function DropdownInput<K extends keyof NovelEntry>({ column_id, display_name, novel_diffs, cell_values}: DropdownInputProps<K>) {
  const {data: session} = useSession();
  const modified_css = novel_diffs.novel[column_id] === novel_diffs.orig_novel[column_id] ? "" : modified;

  // only allow editing for admins
  let content;
  if (session?.user?.role !== 'admin') {
    content = novel_diffs.novel[column_id];
  } else {
    content =
      <DropdownMenu>
        <DropdownMenuTrigger className="w-full text-left">{novel_diffs.novel[column_id] || "Unselected"}</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSeparator />
          {
            Object.keys(cell_values).map((key) => {
              return (
                <DropdownMenuItem key={key} onClick={() => novel_diffs.setNovel({...novel_diffs.novel, [column_id]: cell_values[key]})}>
                  {cell_values[key]}
                </DropdownMenuItem>
              )
            })
          }
          <DropdownMenuItem key={null} onClick={() => novel_diffs.setNovel({...novel_diffs.novel, [column_id]: null})}>
            Unselected
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
  }

  return (
    <div className="col-span-2 space-y-1">
      <div>{display_name}</div>
      <Bordered classname={modified_css}>{content}</Bordered>
    </div>
  )
}

interface DatePickerProps {
  column_id: keyof NovelEntry
  display_name: string
  novel_diffs: NovelDiffs
}

function DatePicker({column_id, display_name, novel_diffs}: DatePickerProps) {
  function reprDate(date: Date | null) {
    return date ? date.toISOString().split('T')[0] : "";
  }

  const date = novel_diffs.novel[column_id] ? new Date(novel_diffs.novel[column_id] as string) : null;
  const orig_date = novel_diffs.orig_novel[column_id] ? new Date(novel_diffs.orig_novel[column_id] as string) : null;
  const {data: session} = useSession();

  // two null dates are the same
  // two valid dates are the same if units at least a day long are the same
  let same_date = !date && !orig_date;
  if (date && orig_date) {
    same_date = same_date || (date.toISOString() === orig_date.toISOString());
  }
  const modified_css = same_date ? "" : modified;

  let content = <Bordered>{reprDate(date)}</Bordered>;
  if (session?.user?.role === 'admin') {
    content = (
      <>
        <Input
          type="date"
          value={reprDate(date)}
          onChange={(e) => {
            if (!e.target.value) {
              novel_diffs.setNovel({...novel_diffs.novel, [column_id]: null});
              return;
            }
            const new_date = new Date(e.target.value);
            novel_diffs.setNovel({...novel_diffs.novel, [column_id]: new_date.toISOString()});
          }}
          className={cn("w-full", modified_css)}
        />
        <Button 
          onClick={() => novel_diffs.setNovel({...novel_diffs.novel, [column_id]: null})}
          variant="secondary_muted"
          className="w-full"
        >
          Clear Date
        </Button>
      </>
    )
  }

  return (
    <div className="col-span-3 flex flex-col space-y-1">
      <div>{display_name}</div>
      {content}
    </div>
  )
}

async function update_row(novel: NovelEntry): Promise<NovelEntry | null> {
  // send the update to the backend
  const to_send: NovelEntryApi[] = [entry_to_api(novel)];
  const response = await fetch_backend(
    {path: "/api/update_novels", method: "POST", body: JSON.stringify(to_send), contentType: "application/json"}
  );
  const novels = response.data as NovelEntryApi[] | null;
  return novels ? api_to_entry(novels[0]) : null; 
}
