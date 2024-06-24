"use client";

export type NovelEntryCol = "country" | "title" | "chapter" | "rating" | "status" | "tags" | "notes" | "date_modified";

export type NovelEntry = {
  country: String,
  title: String,
  chapter: Chapter,
  rating: Number,
  status: String,
  tags: String[],
  notes: String,
  date_modified: Date,
}

export type Chapter = Web | Novel | Invalid;

interface Web {
  kind: "Web",
  Web: Number
}

interface Novel {
  kind: "Novel",
  Novel: {
    volume: Number,
    chapter: Number,
    part: Number
  }
}

interface Invalid {
  kind: "Invalid",
}

export function compare_chapter(chapter1: Chapter, chapter2: Chapter): number {
  // handle all invalid
  if (chapter1.kind == "Invalid" && chapter2.kind == "Invalid") {
    return 0;
  }
  else if (chapter1.kind == "Invalid") {
    return -1;
  }
  else if (chapter2.kind == "Invalid") {
    return 1;
  }

  // handle all web
  if (chapter1.kind == "Web" && chapter2.kind == "Web") {
    return Number(chapter1.Web) > Number(chapter2.Web) ? 1 : -1;
  }
  else if (chapter1.kind == "Web") {
    return 1;
  }
  else if (chapter2.kind == "Web") {
    return -1;
  }

  // handle all novel; both chapters must be novels at this point
  if (chapter1.kind == "Novel" && chapter2.kind == "Novel") {
    if (chapter1.Novel.volume != chapter2.Novel.volume) {
      return chapter1.Novel.volume > chapter2.Novel.volume ? 1 : -1;
    }
    if (chapter1.Novel.chapter != chapter2.Novel.chapter) {
      return chapter1.Novel.chapter > chapter2.Novel.chapter ? 1 : -1;
    }
    if (chapter1.Novel.part != chapter2.Novel.part) {
      return chapter1.Novel.part > chapter2.Novel.part ? 1 : -1;
    }
    return 0;
  }

  throw new Error("Invalid chapters: " + chapter1.kind + ", " + chapter2.kind);
}

export function parse_novels(unprocessed_novels: NovelEntry[]): NovelEntry[] {
  const novels: NovelEntry[] = unprocessed_novels.map((novel: any) => ({
    country: novel.country,
    title: novel.title,
    chapter: create_chapter(novel.chapter),
    rating: novel.rating,
    status: novel.status,
    tags: process_tags(novel.tags),
    notes: novel.notes,
    date_modified: novel.date_modified
  }));

  return novels;
}

function create_chapter(chapter: unknown): Chapter {
  if (!isJSON(chapter)) {
    return { kind: "Invalid" };
  }

  const jsonChapter = chapter as {[key: string]: any };
  if ("Web" in jsonChapter) {
    return { kind: "Web", Web: jsonChapter.Web };
  } 
  // else if ("Novel" in jsonChapter) {
  else {
    return { kind: "Novel", Novel: 
      {
        volume: jsonChapter.Novel.volume,
        chapter: jsonChapter.Novel.chapter,
        part: jsonChapter.Novel.part
      }
    };
  }
}

function process_tags(tags: String[]): String[] {
  // remove trailing or leading spaces
  for (let i = 0; i < tags.length; i++) {
    tags[i] = tags[i].trim();
  }
  return tags;
}

export function format_chapter(chapter: Chapter): String {
  switch (chapter.kind) {
    case "Web":
      return String(chapter.Web);
    case "Novel":
      return `V${chapter.Novel.volume}C${chapter.Novel.chapter}P${chapter.Novel.part}`;
    case "Invalid":
      return "";
  }
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
