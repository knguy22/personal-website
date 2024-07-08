import { NextApiRequest, NextApiResponse } from "next";
import { NovelEntry } from "@/app/novels/novel-types";

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
    const novel: NovelEntry = await response.json();
    console.log("Response: " + JSON.stringify(novel));
    return novel;
  } catch (error) {
    console.log("Fetch backend error: " + error);
  }
  return null;
}
