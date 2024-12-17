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

import { Table } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

import { CellContext } from "@tanstack/react-table"
import { Status, NovelEntry, NovelEntryApi, entry_to_api, novel_entries_equal } from "./novel-types"
import { DeleteRowButton } from "./delete-row-button"
import { fetch_backend } from "@/utils/fetch_backend"

export function RowEditor({ row, table }: CellContext<NovelEntry, string>) {
  const [novel, setNovel] = useState<NovelEntry>(row.original)
  const {data: session} = useSession();
  const date = new Date(row.original.date_modified);

  async function update_novel(novel: NovelEntry) {
    if (novel_entries_equal(novel, row.original)) {
      return;
    }

    // update locally
    for (const [key, value] of Object.entries(novel)) {
      if (key === "date_modified" || key === "id") {
        continue;
      }
      table.options.meta?.updateCell(row.index, key, value.toString());
    }

    // update backend
    let new_date = await update_row(novel, row.index, table);
    if (new_date) {
      table.options.meta?.updateCell(row.index, 'date_modified', new_date);
    }
  }

  return (
    <Dialog>
      <DialogTrigger className={cn(buttonVariants({ variant: "outline", size: "sm", className: "" }))}>
        {session?.user?.role === "admin" ? "Open Row Editor" : "View Details"}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">{row.original.title}</DialogTitle>
          <DialogDescription/>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-x-4 gap-y-3 pt-2">
          <div className="col-span-3">
            <EditorInput column_id="title" display_name="Title" novel={row.original} setNovel={setNovel}/>
          </div>
          <EditorInput column_id="country" display_name="Country" novel={row.original} setNovel={setNovel} />
          <RatingEditorInput column_id="rating" display_name="Rating" novel={row.original} setNovel={setNovel} />
          <EditorInput column_id="chapter" display_name="Chapter" novel={row.original} setNovel={setNovel} />
          <DropdownInput column_id="status" display_name="Status" novel={row.original} cell_values={Status} />
          <div className="col-span-2 flex flex-col space-y-1">
            <div className="text-md">{"Date Modified"}</div>
            <Bordered>
              <div className="flex flex-row space-x-1">
                <div className="flex items-center">{date.toDateString()}</div>
                <div className="flex items-center">{date.toLocaleTimeString()}</div>
              </div>
            </Bordered>
          </div>
          <div className="col-span-3">
            <EditorInput column_id="notes" display_name="Notes" novel={row.original} setNovel={setNovel} />
          </div>
          <div className="col-span-3">
            <EditorInput column_id="tags" display_name="Tags" novel={row.original} setNovel={setNovel} />
          </div>
        </div>
        <div className="grid grid-cols-3 pt-5">
          <DeleteRowButton row={row} table={table} />
          <div></div>
          <Button size="sm" onClick={() => update_novel(novel)}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface EditorInputProps {
  column_id: keyof NovelEntry
  display_name: string
  novel: NovelEntry
  setNovel: (novel: NovelEntry) => void
}

function EditorInput({ column_id, display_name, novel, setNovel, ...props } : EditorInputProps) {
  const [value, setValue] = useState(novel[column_id]);
  const {data: session} = useSession();

  const onBlur = () => {
    setNovel({...novel, [column_id]: value});
  }

  // only allow editing for admins
  let content;
  if (session?.user?.role !== 'admin') {
    content = <Bordered>{value}</Bordered>
  } else {
    content = 
      <Input
        value={value}
        onChange={e => setValue(e.target.value)}
        onBlur={onBlur}
        className='w-full'
        {...props}
      />
  }

  return (
    <div className="flex flex-col space-y-1">
      <div className="text-md">{display_name}</div>
      {content}
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

interface DropdownInputProps {
  column_id: keyof NovelEntry
  display_name: string
  novel: NovelEntry
  cell_values: { [key: string]: string };
}

function DropdownInput({ column_id, display_name, novel, cell_values}: DropdownInputProps) {
  const [value, setValue] = useState(novel[column_id]);
  const {data: session} = useSession();

  // only allow editing for admins
  let content;
  if (session?.user?.role !== 'admin') {
    content = value;
  } else{
    content = 
      <DropdownMenu>
        <DropdownMenuTrigger className="w-full text-left">{value.toString()}</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSeparator />
          {
            Object.keys(cell_values).map((key) => {
              return (
                <DropdownMenuItem key={key} onClick={() => setValue(cell_values[key])}>
                  {cell_values[key]}
                </DropdownMenuItem>
              )
            })
          }
        </DropdownMenuContent>
      </DropdownMenu>
  }

  return (
    <div className="col-span-1 space-y-1">
      <div>{display_name}</div>
      <Bordered>{content}</Bordered>
    </div>
  )
}

interface BorderedProps {
  children?: React.ReactNode;
}

export function Bordered({ children }: BorderedProps) {
  return (
    <div className="flex items-center w-full h-10 overflow-x-auto text-wrap rounded-md border border-input bg-background px-3 text-sm ring-offset-background">
      {children}
    </div>
  )
}

async function update_row(novel: NovelEntry, row_idx: number, table: Table<NovelEntry>): Promise<string | null> {
  // send the update to the backend
  const to_send: NovelEntryApi[] = [entry_to_api(novel)];
  const response = await fetch_backend(
    {path: "/api/update_novels", method: "POST", body: JSON.stringify(to_send), contentType: "application/json"}
  );
  const novels = response.data as NovelEntryApi[] | null;

  // check if the update was successful
  if (!novels) {
    return null;
  }

  // update the date
  const new_date = novels[0].date_modified;
  table.options.meta?.updateCell(row_idx, 'date_modified', new_date);
  return new_date;
}
