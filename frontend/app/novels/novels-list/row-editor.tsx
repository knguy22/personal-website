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
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

import { CellContext } from "@tanstack/react-table"
import { Status, NovelEntry, NovelEntryApi, entry_to_api, novel_entries_equal, novel_col_names } from "./novel-types"
import { DeleteRowButton } from "./delete-row-button"
import { fetch_backend } from "@/utils/fetch_backend"

const modified: string = "bg-secondary text-secondary-foreground";

export function RowEditor({ row, table }: CellContext<NovelEntry, string>) {
  const [novel, setNovel] = useState<NovelEntry>(row.original)
  const {data: session} = useSession();
  const date_modified = new Date(row.original.date_modified);

  async function update_novel(novel: NovelEntry) {
    if (novel_entries_equal(novel, row.original)) {
      return;
    }

    // update locally
    for (const key of novel_col_names) {
      if (key === "date_modified" || key === "id") {
        continue;
      }
      table.options.meta?.updateCell(row.index, key, novel[key]);
    }

    // update backend
    let new_date = await update_row(novel, row.index, table);
    if (new_date) {
      table.options.meta?.updateCell(row.index, 'date_modified', new_date);
    }
  }

  const dialog_buttons = session?.user?.role === "admin" ?
    <div className="grid grid-cols-3 pt-3">
      <DeleteRowButton row={row} table={table} />
      <div></div>
      <Button size="sm" variant="default" onClick={() => update_novel(novel)}>Save</Button>
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
            <EditorInput column_id="title" display_name="Title" orig_novel={row.original} novel={novel} setNovel={setNovel}/>
          </div>
          <EditorInput column_id="country" display_name="Country" orig_novel={row.original} novel={novel} setNovel={setNovel} />
          <EditorInput column_id="chapter" display_name="Chapter" orig_novel={row.original} novel={novel} setNovel={setNovel} />
          <RatingEditorInput column_id="rating" display_name="Rating" orig_novel={row.original} novel={novel} setNovel={setNovel} />
          <DropdownInput column_id="status" display_name="Status" orig_novel={row.original} novel={novel} setNovel={setNovel} cell_values={Status} />
          <div className="col-span-4 flex flex-col space-y-1">
            <div className="text-md">{"Date Modified"}</div>
            <Bordered>
              <div className="flex flex-row space-x-1">
                <div className="flex items-center">{date_modified.toDateString()}</div>
                <div className="flex items-center">{date_modified.toLocaleTimeString()}</div>
              </div>
            </Bordered>
          </div>
          <DatePicker column_id="date_started" display_name="Date Started" orig_novel={row.original} novel={novel} setNovel={setNovel} />
          <DatePicker column_id="date_completed" display_name="Date Completed" orig_novel={row.original} novel={novel} setNovel={setNovel} />
          <LargeEditorInputProps column_id="notes" display_name="Notes" orig_novel={row.original} novel={novel} setNovel={setNovel} />
          <LargeEditorInputProps column_id="tags" display_name="Tags" orig_novel={row.original} novel={novel} setNovel={setNovel} />
        </div>
        {dialog_buttons}
      </DialogContent>
    </Dialog>
  )
}

interface EditorInputProps {
  column_id: keyof NovelEntry
  display_name: string
  orig_novel: NovelEntry
  novel: NovelEntry
  setNovel: (novel: NovelEntry) => void
}

function EditorInput({ column_id, display_name, orig_novel, novel, setNovel, ...props } : EditorInputProps) {
  const [value, setValue] = useState(novel[column_id]);
  const {data: session} = useSession();
  const modified_css = novel[column_id] === orig_novel[column_id] ? "" : modified;

  const onBlur = () => {
    setNovel({...novel, [column_id]: value});
  }

  return (
    <div className="col-span-2 flex flex-col space-y-1">
      <div className="text-md">{display_name}</div>
      <Input
        value={value ? value : ""}
        readOnly={session?.user?.role !== 'admin'}
        onChange={e => setValue(e.target.value)}
        onBlur={onBlur}
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

interface DropdownInputProps {
  column_id: keyof NovelEntry
  display_name: string
  orig_novel: NovelEntry
  novel: NovelEntry
  setNovel: (novel: NovelEntry) => void
  cell_values: { [key: string]: string };
}

function DropdownInput({ column_id, display_name, orig_novel, novel, setNovel, cell_values}: DropdownInputProps) {
  const [value, setValue] = useState(novel[column_id]);
  const {data: session} = useSession();
  const modified_css = novel[column_id] === orig_novel[column_id] ? "" : modified;

  if (value === null) {
    return null;
  }

  function update_value(value: string) {
    setValue(value);
    setNovel({...novel, [column_id]: value});
  }

  // only allow editing for admins
  let content;
  if (session?.user?.role !== 'admin') {
    content = value;
  } else {
    content =
      <DropdownMenu>
        <DropdownMenuTrigger className="w-full text-left">{value ? value.toString() : ""}</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSeparator />
          {
            Object.keys(cell_values).map((key) => {
              return (
                <DropdownMenuItem key={key} onClick={() => update_value(cell_values[key])}>
                  {cell_values[key]}
                </DropdownMenuItem>
              )
            })
          }
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

interface LargeEditorInputProps {
  column_id: keyof NovelEntry
  display_name: string
  orig_novel: NovelEntry
  novel: NovelEntry
  setNovel: (novel: NovelEntry) => void
}

function LargeEditorInputProps({ column_id, display_name, orig_novel, novel, setNovel, ...props } : EditorInputProps) {
  const [value, setValue] = useState(novel[column_id]);
  const {data: session} = useSession();
  const modified_css = novel[column_id] === orig_novel[column_id] ? "" : modified;

  const onBlur = () => {
    setNovel({...novel, [column_id]: value});
  }

  return (
    <div className="col-span-6 flex flex-col space-y-1">
      <div className="text-md">{display_name}</div>
      <Textarea
        value={value ? value : ""}
        readOnly={session?.user?.role !== 'admin'}
        onChange={e => setValue(e.target.value)}
        onBlur={onBlur}
        rows={4}
        className={cn('w-full', modified_css)}
        {...props}
      />
    </div>
  )
}

interface DatePickerProps {
  column_id: keyof NovelEntry
  display_name: string
  orig_novel: NovelEntry
  novel: NovelEntry
  setNovel: (novel: NovelEntry) => void
}

function DatePicker({column_id, display_name, orig_novel, novel, setNovel}: DatePickerProps) {
  const [date, setDate] = useState<Date | null>(novel[column_id] ? new Date(novel[column_id] as string) : null);
  const {data: session} = useSession();

  // can't compare dates directly; have to only extract units at least a day long
  const both_null = novel[column_id] === null && orig_novel[column_id] === null;
  let same_date = false;
  if (novel[column_id] !== null && orig_novel[column_id] !== null) {
    const orig_date = new Date(orig_novel[column_id] as string);
    const new_date = new Date(novel[column_id] as string);
    same_date = orig_date.toISOString() === new_date.toISOString();
  }
  const modified_css = (both_null || same_date) ? "" : modified;

  function reprDate(date: Date | null) {
    return date ? date.toISOString().split('T')[0] : "";
  }

  function handleReset() {
    setDate(null);
    setNovel({...novel, [column_id]: null});
  }

  let content = <Bordered>{reprDate(date)}</Bordered>;
  if (session?.user?.role === 'admin') {
    content = (
      <>
        <Input
          type="date"
          value={reprDate(date)}
          onChange={(e) => {
            if (!e.target.value) {
              setDate(null);
              setNovel({...novel, [column_id]: null});
              return;
            }

            const new_date = new Date(e.target.value);
            setDate(new_date);
            setNovel({...novel, [column_id]: new_date.toISOString()});
          }}
          className={cn("w-full", modified_css)}
        />
        <Button 
          onClick={handleReset} 
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

interface BorderedProps {
  children?: React.ReactNode;
  classname?: string
}

export function Bordered({ children, classname }: BorderedProps) {
  return (
    <div className={cn("flex items-center w-full h-12 overflow-x-auto text-wrap rounded-md border border-input bg-background px-3 text-md ring-offset-background", classname)}>
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
