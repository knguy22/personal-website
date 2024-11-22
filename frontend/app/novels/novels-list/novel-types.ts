
export type NovelEntryApi = {
  id: number,
  country: string,
  title: string,
  chapter: string,
  rating: number,
  status: string,
  tags: string[],
  notes: string,
  date_modified: string,
}

export type NovelEntry = {
  id: number,
  country: string,
  title: string,
  chapter: string,
  rating: string,
  status: StatusType,
  tags: string,
  notes: string,
  date_modified: string,
}

export const novel_col_names: (keyof NovelEntry)[] = ["country", "title", "chapter", "rating", "status", "tags", "notes", "date_modified"];

export const Status = {
  Reading: "Reading",
  Completed: "Completed",
  Waiting: "Waiting",
  Dropped: "Dropped",
  Hiatus: "Hiatus",
  Invalid: "Invalid",
} as const;

export type StatusType = typeof Status[keyof typeof Status];

export function str_to_status(value: string): StatusType {
  if (value in Status) {
    return Status[value as keyof typeof Status];
  }
  return Status.Invalid;
}

export function status_to_str(status: StatusType): string {
  return status.toString();
}

export function api_to_entry(novel: NovelEntryApi): NovelEntry {
  return {
    id: novel.id,
    country: novel.country,
    title: novel.title,
    chapter: novel.chapter,
    rating: novel.rating !== 0 ? String(novel.rating) : "",
    status: str_to_status(novel.status),
    tags: novel.tags.join(","),
    notes: novel.notes,
    date_modified: novel.date_modified,
  }
}

export function entry_to_api(novel: NovelEntry): NovelEntryApi {
  return {
    id: novel.id,
    country: novel.country,
    title: novel.title,
    chapter: novel.chapter,
    rating: novel.rating === "" ? 0 : parseInt(novel.rating, 10),
    status: novel.status.toString(),
    tags: process_tags(novel.tags),
    notes: novel.notes,
    date_modified: novel.date_modified,
  }
}

export function novel_entries_equal(a: NovelEntry, b: NovelEntry) {
  for (const key of novel_col_names) {
    if (key == "date_modified") {
      continue;
    }

    if (key == "tags") {
      for (let i = 0; i < a[key].length; i++) {
        if (b[key][i] !== a[key][i]) {
          return false;
        }
      }
    }
    else if (a[key] !== b[key]) {
      return false;
    }
  }
  return true;
}

export function process_tags(tags: string | undefined): string[] {
  if (!tags) {
    return [];
  }
  return tags.split(',').map((tag) => tag.trim());
}

// not a json, params will not be labeled
export function to_string_arr(novel: NovelEntry): string[] {
  const cols = novel_col_names.map((key) => novel[key]);
  return cols.map((col) => String(col));
}