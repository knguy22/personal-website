'use client'

import { CellContext } from "@tanstack/react-table";

export function ReadOnlyCell<TData>({ getValue }: CellContext<TData, string>) {
  return <div className="text-md px-4">{getValue()}</div>
}
