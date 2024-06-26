"use client";

export type NovelEntry = {
  country: string,
  title: string,
  chapter: string,
  rating: number,
  status: string,
  tags: string,
  notes: string,
  date_modified: Date,
}
const novel_col_names: (keyof NovelEntry)[] = ["country", "title", "chapter", "rating", "status", "tags", "notes", "date_modified"];

export function parse_novels(unprocessed_novels: NovelEntry[]): NovelEntry[] {
  const novels: NovelEntry[] = unprocessed_novels.map((novel: any) => ({
    country: novel.country,
    title: novel.title,
    chapter: novel.chapter,
    rating: novel.rating,
    status: novel.status,
    tags: novel.tags,
    notes: novel.notes,
    date_modified: novel.date_modified
  }));

  return novels;
}

export function process_tags(tags: String): String[] {
  return tags.split(',').map((tag) => tag.trim());
}

export function novel_entries_equal(a: NovelEntry, b: NovelEntry) {
  for (const key of novel_col_names) {
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

function isJSON(obj: unknown): boolean {
  const value = typeof obj !== "string" ? JSON.stringify(obj) : obj;
  try {
    JSON.parse(value);
  } catch (e) {
    return false;
  }
  return true;
}
