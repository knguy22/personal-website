"use client"

import { useEffect, useState } from "react"
import { useSession } from 'next-auth/react'

import { Button } from "@/components/ui/button"
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
          <DialogDescription className="grid grid-cols-3">
            <EditorInput init_value={row.original.country} column_id="country" row={row} table={table} />
            <EditorInput init_value={row.original.rating} column_id="rating" row={row} table={table} />
          </DialogDescription>
          <DeleteRowButton row={row} table={table} />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

interface EditorInputProps {
  init_value: string
  column_id: string
  row: Row<NovelEntry>
  table: Table<NovelEntry>
}

function EditorInput({ init_value, column_id, row, table, ...props } : EditorInputProps) {
  const [value, setValue] = useState(init_value);
  const {data: session} = useSession();

  const onBlur = () => {
    table.options.meta?.updateCell(row.index, column_id, value);
  }

  // only allow editing for admins
  if (session?.user?.role !== 'admin') {
    return <div className='max-h-10 max-w-44 overflow-auto text-nowrap scrollbar-thin'>{value}</div>
  }
  return (
    <div>
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        onBlur={onBlur}
        className='h-full w-full'
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
