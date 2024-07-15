import { NextApiRequest, NextApiResponse } from "next";
import { NovelEntry, NovelEntryApi, process_tags } from "@/app/novels/novel-types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    const body: NovelEntry = req.body;
    console.log("Updating novel: " + JSON.stringify(body));

    await update_backend_novel(body);
    res.status(200).json({ message: 'Novel updated successfully' });
}

async function update_backend_novel(novel: NovelEntry): Promise<void> {
  const backend_url = process.env.BACKEND_URL + '/api/update_novels';

  const to_send: NovelEntryApi = {
    id: novel.id,
    country: novel.country,
    title: novel.title,
    chapter: novel.chapter,
    rating: novel.rating === "" ? 0 : parseInt(novel.rating, 10),
    status: novel.status,
    tags: process_tags(novel.tags),
    notes: novel.notes,
    date_modified: novel.date_modified
  };

  // backend api only accepts a list of NovelEntries
  try {
    await fetch(backend_url, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: '[' + JSON.stringify(to_send) + ']',
    });
  } catch (error) {
    console.log("Fetch backend error: " + error);
  }
}
