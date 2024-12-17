'use client'

import { CellContext } from "@tanstack/react-table";

export function ReadOnlyCell<TData>({ getValue }: CellContext<TData, string>) {
  return <div>{getValue()}</div>
}