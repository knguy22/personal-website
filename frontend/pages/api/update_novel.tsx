import { NextApiRequest, NextApiResponse } from "next";
import { NovelEntry, NovelEntryApi, update_backend_novel} from "@/app/novels/novel_types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    const body: NovelEntry = req.body;
    update_backend_novel(body);
    res.status(200).json({ message: 'Novel updated successfully' });
}
