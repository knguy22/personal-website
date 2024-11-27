'use server'

export interface BackendRequest {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  body?: BodyInit;
  contentType?: string;
} 

export async function fetch_backend({ path, method, body, contentType }: BackendRequest): Promise<unknown | null> {
  if (process.env.BACKEND_URL === undefined) {
    return null;
  }
  const backend_url: string = process.env.BACKEND_URL + path;

  // try block is needed because fetch will throw errors for network issues
  try {
    const init: RequestInit = {
      method: method,
      headers: contentType === undefined ? undefined : {
        "Content-Type": contentType,
      },
      body: body,
    };
    const response = await fetch(backend_url, init);

    // response will also not be ok for other issues like backend issues
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch {
    return null;
  }
}
