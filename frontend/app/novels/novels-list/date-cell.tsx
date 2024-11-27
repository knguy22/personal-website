import { useState, useEffect } from 'react';
import { Row, Table, CellContext } from "@tanstack/react-table";
import { fetch_backend } from '@/utils/fetch_backend.ts';
import { NovelEntry, NovelEntryApi, novel_entries_equal, entry_to_api } from './novel-types';

export const DateCell = ({ getValue, row, table } : CellContext<NovelEntry, Date | string>) => {
  const [date, setDate] = useState<Date>(new Date(getValue()));
  const [row_copy, setRowCopy] = useState(row);

  useEffect(() => {
    // don't spam updates
    if (novel_entries_equal(row.original, row_copy.original)) {
      return;
    }
    if (row.original.id != row_copy.original.id) {
      return;
    }
    setRowCopy(row);

    update_row(row, setDate, table);
  }, [date, row, row_copy, table]);

  return (
    <div>
      {date.toDateString()}
      <br />
      {date.toLocaleTimeString()}
    </div>
  )
}

async function update_row(row: Row<NovelEntry>, setDate: (date: Date) => void, table: Table<NovelEntry>): Promise<null> {
  // send the update to the backend
  const novel: NovelEntry = row.original;
  const to_send: NovelEntryApi[] = [entry_to_api(novel)];
  const novels: NovelEntryApi[] | null = await fetch_backend(
    {path: "/api/update_novels", method: "POST", body: JSON.stringify(to_send), contentType: "application/json"}
  ) as NovelEntryApi[] | null;

  // check if the update was successful
  if (!novels) {
    return null;
  }

  // update the date
  const new_date = novels[0].date_modified;
  setDate(new Date(new_date));
  table.options.meta?.updateCell(row.index, 'date_modified', new_date);
  return null;
}
