
export type NovelEntryApi = {
  id: number,
  country: string,
  title: string,
  chapter: string,
  rating: number,
  status: string,
  tags: string[],
  notes: string,
  date_modified: Date,
}

export type NovelEntry = {
  id: number,
  country: string,
  title: string,
  chapter: string,
  rating: string,
  status: string,
  tags: string,
  notes: string,
  date_modified: Date,
}

export const novel_col_names: (keyof NovelEntry)[] = ["country", "title", "chapter", "rating", "status", "tags", "notes", "date_modified"];

export function parse_novels(unprocessed_novels: NovelEntryApi[]): NovelEntry[] {
  const novels: NovelEntry[] = unprocessed_novels.map((novel: NovelEntryApi) => ({
    id: novel.id,
    country: novel.country,
    title: novel.title,
    chapter: novel.chapter,
    rating: novel.rating !== 0 ? String(novel.rating) : "",
    status: novel.status,
    tags: novel.tags.join(","),
    notes: novel.notes,
    date_modified: novel.date_modified
  }));

  return novels;
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
  let cols = novel_col_names.map((key) => novel[key]);
  return cols.map((col) => String(col));
}