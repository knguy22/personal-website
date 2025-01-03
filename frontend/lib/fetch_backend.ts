'use server'

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { z } from "zod";

const public_routes: string[] = [
  "/api/novels",
  "/api/novels_stats",
  "/api/random_novels",
];

const admin_routes: string[] = [
  "/api/update_novels",
  "/api/upload_novels_backup",
  "/api/create_novel",
  "/api/delete_novel",
];

const BackendRequestSchema = z.object({
  path: z.string(),
  method: z.enum(["GET", "POST", "PUT", "DELETE"]),
  body: z.unknown(),
  contentType: z.string().optional(),
});
export type BackendRequest = z.infer<typeof BackendRequestSchema>;

export type BackendRequestResponse = {
  data: unknown;
  error: unknown;
}

export async function fetch_backend(input: BackendRequest): Promise<BackendRequestResponse> {
  // validate input using zod
  const res = BackendRequestSchema.safeParse(input);
  if (!res.success) {
    return {data: null, error: res.error};
  }
  const {path, method, body, contentType} = res.data;

  // validate backend url
  if (process.env.BACKEND_URL === undefined) {
    return {data: null, error: "BACKEND_URL is not defined"};
  }
  const backend_url: string = process.env.BACKEND_URL + path;

  // validate permissions for routes
  const session = await getServerSession(authOptions);
  if (!public_routes.includes(path) && !admin_routes.includes(path)) {
    return {data: null, error: "Invalid route"};
  }
  if (session?.user?.role !== 'admin' && admin_routes.includes(path)) {
    return {data: null, error: "Unauthorized"};
  }

  // try block is needed because fetch will throw errors for network issues
  try {
    const init: RequestInit = {
      method: method,
      headers: contentType === undefined ? undefined : {
        "Content-Type": contentType,
      },
      body: body as BodyInit,
    };
    const response = await fetch(backend_url, init);

    // response will also not be ok for other issues like backend issues
    if (!response.ok) {
      return {data: null, error: await response.text()};
    }
    return {data: await response.json(), error: null}
  } catch (e) {
    return {data: null, error: JSON.stringify(e)};
  }
}
