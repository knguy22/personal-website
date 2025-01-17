export const NovelSubsets = {
  All: "All",
  NotSus: "NotSus",
} as const;
export type NovelSubset = typeof NovelSubsets[keyof typeof NovelSubsets];

export type NovelEntryApi = {
  id: number,
  country: string,
  title: string,
  chapter: string,
  rating: number,
  status: Status | null,
  tags: string[],
  notes: string,
  provider: Provider | null,
  date_modified: string,
  date_started: string | null,
  date_completed: string | null,
}

export type NovelEntry = {
  id: number,
  country: string,
  title: string,
  chapter: string,
  rating: string,
  status: Status | null,
  tags: string,
  notes: string,
  provider: Provider | null,
  date_modified: string,
  date_started: string | null,
  date_completed: string | null,
}

export const novel_col_names: (keyof NovelEntry)[] = [
  "id",
  "country",
  "title",
  "chapter",
  "rating",
  "status",
  "tags",
  "notes",
  "provider",
  "date_modified",
  "date_started",
  "date_completed"
];

export const Provider = {
  NovelUpdates: "NovelUpdates",
  RoyalRoad: "RoyalRoad",
} as const;
export type Provider = typeof Provider[keyof typeof Provider];

export const Status = {
  Reading: "Reading",
  Completed: "Completed",
  Waiting: "Waiting",
  Dropped: "Dropped",
  Hiatus: "Hiatus",
} as const;
export type Status = typeof Status[keyof typeof Status];

export function status_to_str(status: Status): string {
  return status.toString();
}

export function api_to_entry(novel: NovelEntryApi): NovelEntry {
  return {
    id: novel.id,
    country: novel.country,
    title: novel.title,
    chapter: novel.chapter,
    rating: novel.rating !== 0 ? String(novel.rating) : "",
    status: novel.status,
    tags: novel.tags.join(","),
    notes: novel.notes,
    provider: novel.provider,
    date_modified: novel.date_modified,
    date_started: novel.date_started,
    date_completed: novel.date_completed
  }
}

export function entry_to_api(novel: NovelEntry): NovelEntryApi {
  return {
    id: novel.id,
    country: novel.country,
    title: novel.title,
    chapter: novel.chapter,
    rating: novel.rating === "" ? 0 : parseInt(novel.rating, 10),
    status: novel.status,
    tags: process_tags(novel.tags),
    notes: novel.notes,
    provider: novel.provider,
    date_modified: novel.date_modified,
    date_started: novel.date_started,
    date_completed: novel.date_completed
  }
}

export function novel_entries_equal(a: NovelEntry, b: NovelEntry) {
  for (const key of novel_col_names) {
    if (key == "date_modified") {
      continue;
    }

    if (a[key] !== b[key]) {
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
