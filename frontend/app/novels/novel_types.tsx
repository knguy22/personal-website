"use client";

export type NovelEntryApi = {
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

export function parse_novels(unprocessed_novels: NovelEntryApi[]): NovelEntry[] {
  const novels: NovelEntry[] = unprocessed_novels.map((novel: NovelEntryApi) => ({
    country: novel.country,
    title: novel.title,
    chapter: novel.chapter,
    rating: novel.rating,
    status: novel.status,
    tags: novel.tags.join(","),
    notes: novel.notes,
    date_modified: novel.date_modified
  }));

  return novels;
}

export function update_backend_novel(novel: NovelEntry): void {
  const backend_url = process.env.BACKEND_URL + '/api/update_novels';

  const to_send: NovelEntryApi = {
    country: novel.country,
    title: novel.title,
    chapter: novel.chapter,
    rating: novel.rating,
    status: novel.status,
    tags: process_tags(novel.tags),
    notes: novel.notes,
    date_modified: novel.date_modified
  };

  console.log("Updating novel: " + JSON.stringify(to_send));

  fetch(backend_url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(to_send),
  });
}

export function process_tags(tags: string): string[] {
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
