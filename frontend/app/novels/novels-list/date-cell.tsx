import { useState, useEffect } from 'react';
import { Row } from "@tanstack/react-table"
import { fetch_backend } from '@/utils/fetch_backend.ts';
import { NovelEntry, NovelEntryApi, novel_entries_equal, process_tags } from './novel-types';

interface DateCellProps {
  getValue: any
  row: Row<any>
  table: any
}

// "any" used to be compatible with tanstack table
export function DateCell ({ getValue, row, table } : DateCellProps) {
  const [date, setDate] = useState<Date>(new Date(getValue()));
  const [row_copy, setRowCopy] = useState(row);

  useEffect(() => {
    // don't spam updates
    if (novel_entries_equal(row['original'], row_copy['original'])) {
      return;
    }
    if (row['original'].id != row_copy['original'].id) {
      return;
    }
    setRowCopy(row);

    update_row(row, setDate, table);
  }, [date, row, row_copy, table]);

  try {
    return date.toISOString();
  }
  catch (error) {
    return "";
  }
}

async function update_row(row: Row<any>, setDate: (date: Date) => void, table: any): Promise<null> {
  // send the update to the backend
  const novel: NovelEntry = row['original'];
  const to_send: NovelEntryApi[] = [{
    id: novel.id,
    country: novel.country,
    title: novel.title,
    chapter: novel.chapter,
    rating: novel.rating === "" ? 0 : parseInt(novel.rating, 10),
    status: novel.status,
    tags: process_tags(novel.tags),
    notes: novel.notes,
    date_modified: novel.date_modified
  }];
  const novels: NovelEntry[] | null = await fetch_backend({path: "/api/update_novels", method: "POST", body: JSON.stringify(to_send)});

  // check if the update was successful
  if (!novels) {
    return null;
  }

  // update the date
  const new_date = novels[0].date_modified;
  setDate(new Date(new_date));
  table.options.meta.updateCell(row.index, 'date_modified', new_date);
  return null;
}
