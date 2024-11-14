export type BackendRequest = {
    path: string;
    method: "GET" | "POST" | "PUT" | "DELETE";
    body: any | undefined;
}

export async function fetch_backend(back_req: BackendRequest): Promise<any | null> {
  let fetch_arguments = {
    method: "POST",
    headers: back_req.body ? {"Content-Type": "application/json"} : undefined,
    body: JSON.stringify(back_req),
  };

  // try block is needed because fetch will throw errors for network issues
  try {
    let response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/backend', fetch_arguments);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    return null;
  }
}

