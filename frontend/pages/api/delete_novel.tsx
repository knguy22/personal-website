import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    const body: number = req.body;
    console.log("Deleting novel: " + body);

    const response = await delete_backend_novel(body);
    if (!response) {
        res.status(500).json({ error: 'Failed to delete novel' });
    }
    res.status(200).json(response);
}

async function delete_backend_novel(id: number): Promise<boolean> {
  const backend_url: string = process.env.BACKEND_URL + '/api/delete_novel/' + id.toString();

  // backend api only accepts a list of NovelEntries
  try {
    const response = await fetch(backend_url, {
        method: "DELETE",
        headers: {
        "Content-Type": "application/json",
        },
    });
    const response_data: JSON = await response.json();
    console.log("Response: " + JSON.stringify(response_data));
    return true;
  } catch (error) {
    console.log("Fetch backend error: " + error);
  }
  return false;
}
