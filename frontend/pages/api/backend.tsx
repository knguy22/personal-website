import { NextApiRequest, NextApiResponse } from "next";
import { BackendRequest } from "@/utils/fetch_backend";

// the real backend is using rust
// this is just a wrapper around it
export default async function Handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const back_req: BackendRequest = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const backend_url = process.env.BACKEND_URL + back_req.path;

  // try block is needed because fetch will throw errors for network issues
  try {
    const response = await fetch(backend_url, {
      method: back_req.method,
      headers: {
        "Content-Type": "application/json",
      },
      body: back_req.body,
    });

    // response will not be ok for other issues like backend issues
    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({ error: errorText });
    }

    // return the valid response
    const content = await response.json();
    return res.status(200).json(content);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
}
