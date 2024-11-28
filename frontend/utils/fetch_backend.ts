'use server'

export interface BackendRequest {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  body?: BodyInit;
  contentType?: string;
}

export type BackendRequestResponse = {
  data: unknown;
  error: unknown;
}

export async function fetch_backend({ path, method, body, contentType }: BackendRequest): Promise<BackendRequestResponse> {
  if (process.env.BACKEND_URL === undefined) {
    return {data: null, error: "BACKEND_URL is not defined"};
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
      return {data: null, error: await response.text()};
    }
    return {data: await response.json(), error: null}
  } catch (e) {
    return {data: null, error: e};
  }
}
