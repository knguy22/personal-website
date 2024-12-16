"use client"

import { useEffect, useState } from "react"
import { useSession } from 'next-auth/react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Row, Table } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

import { CellContext } from "@tanstack/react-table"
import { NovelEntry } from "./novel-types"
import { DeleteRowButton } from "./delete-row-button"

export function RowEditor({ row, table }: CellContext<NovelEntry, string>) {
  return (
    <Dialog>
      <DialogTrigger className={cn(buttonVariants({ variant: "outline", size: "sm", className: "" }))}>
        Open Row Editor
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">{row.original.title}</DialogTitle>
          <DialogDescription className="grid grid-cols-3 gap-x-4 gap-y-3">
            <EditorInput column_id="country" display_name="Country" row={row} table={table} />
            <EditorInput column_id="title" display_name="Title" row={row} table={table} />
            <RatingEditorInput column_id="rating" display_name="Rating" row={row} table={table} />
            <EditorInput column_id="country" display_name="Chapter" row={row} table={table} />
          </DialogDescription>
          <DeleteRowButton row={row} table={table} />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

interface EditorInputProps {
  column_id: keyof NovelEntry
  display_name: string
  row: Row<NovelEntry>
  table: Table<NovelEntry>
}

function EditorInput({ column_id, display_name, row, table, ...props } : EditorInputProps) {
  const [value, setValue] = useState(row.original[column_id]);
  const {data: session} = useSession();

  // only allow editing for admins
  let content;
  if (session?.user?.role !== 'admin') {
    content = <div className='max-h-10 max-w-44 overflow-auto text-nowrap scrollbar-thin'>{value}</div>;
  } else {
    content = 
      <Input
        value={value}
        onChange={e => setValue(e.target.value)}
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
