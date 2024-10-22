import { NextApiRequest, NextApiResponse } from "next";
import { NovelEntry} from "@/app/novels/novels-list/novel-types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NovelEntry[] | { error: string }>
) {
  const response: Response = await fetch(process.env.BACKEND_URL + '/novels');
  if (!response.ok) {
    res.status(500).json({ error: 'Failed to fetch novels' });
  }
  res.status(200).json(await response.json());
}
