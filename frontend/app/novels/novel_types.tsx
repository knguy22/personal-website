"use client";

export type NovelEntryCol = "country" | "title" | "chapter" | "rating" | "status" | "tags" | "notes" | "date_modified";

export type NovelEntry = {
  country: String,
  title: String,
  chapter: String,
  rating: Number,
  status: String,
  tags: String[],
  notes: String,
  date_modified: Date,
}

export function parse_novels(unprocessed_novels: NovelEntry[]): NovelEntry[] {
  const novels: NovelEntry[] = unprocessed_novels.map((novel: any) => ({
    country: novel.country,
    title: novel.title,
    chapter: novel.chapter,
    rating: novel.rating,
    status: novel.status,
    tags: process_tags(novel.tags),
    notes: novel.notes,
    date_modified: novel.date_modified
  }));

  return novels;
}

function process_tags(tags: String[]): String[] {
  // remove trailing or leading spaces
  for (let i = 0; i < tags.length; i++) {
    tags[i] = tags[i].trim();
  }
  return tags;
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
