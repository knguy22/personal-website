import { NextApiRequest, NextApiResponse } from "next";
import { NovelEntry, NovelEntryApi } from "@/app/novels/novels-list/novel-types";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
    console.log("Creating novel");
    const response = await create_backend_novel();
    if (!response) {
        res.status(500).json({ error: 'Failed to create novel' });
    }
    res.status(200).json(response);
}

async function create_backend_novel(): Promise<NovelEntry | null> {
  const backend_url = process.env.BACKEND_URL + '/api/create_novel';
  // backend api only accepts a list of NovelEntries
  try {
    const response = await fetch(backend_url, {
        method: "GET",
        headers: {
        "Content-Type": "application/json",
        },
    });
    const raw_novel: NovelEntryApi = await response.json();
    const novel: NovelEntry = {
      id: raw_novel.id,
      country: raw_novel.country,
      title: raw_novel.title,
      chapter: raw_novel.chapter,
      rating: raw_novel.rating !== 0 ? String(raw_novel.rating) : "",
      status: raw_novel.status,
      tags: raw_novel.tags.join(","),
      notes: raw_novel.notes,
      date_modified: raw_novel.date_modified
    }
    return novel;
  } catch (error) {
    console.log("Fetch backend error: " + error);
  }
  return null;
}
