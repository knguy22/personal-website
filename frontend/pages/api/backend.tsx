import { NextApiRequest, NextApiResponse } from "next";
import { BackendRequest } from "@/utils/fetch_backend";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    const back_req: BackendRequest = JSON.parse(req.body);
    const backend_url = process.env.BACKEND_URL + back_req.path;

    const response = await fetch(backend_url, {
        method: back_req.method,
        headers: {
        "Content-Type": "application/json",
        },
        body: back_req.body,
    });

    // handle the response
    if (!response.ok) {
        const errorText = await response.text();
        return res.status(500).json({ error: errorText });
    }
    res.status(200).json(await response.json());
}
