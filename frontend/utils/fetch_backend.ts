export type BackendRequest = {
    path: string;
    method: "GET" | "POST" | "PUT" | "DELETE";
    body: BodyInit | undefined;
}

export async function fetch_backend(back_req: BackendRequest): Promise<unknown | null> {
  const fetch_arguments = {
    method: "POST",
    headers: back_req.body ? {"Content-Type": "application/json"} : undefined,
    body: JSON.stringify(back_req),
  };

  // try block is needed because fetch will throw errors for network issues
  try {
    const response = await fetch('/api/backend', fetch_arguments);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch {
    return null;
  }
}

