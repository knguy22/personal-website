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

export function create_chapter(chapter: unknown): Chapter {
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

export function format_chapter(chapter: Chapter): String {
  switch (chapter.kind) {
    case "Web":
      return String(chapter.Web);
    case "Novel":
      return `V${chapter.Novel.volume}C${chapter.Novel.chapter}P${chapter.Novel.part}`;
    case "Invalid":
      return "Invalid";
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