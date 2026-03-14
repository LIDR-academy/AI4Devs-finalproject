import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { decodeSessionCookie, getBackendApiUrl, SESSION_COOKIE_NAME } from "@/lib/server-auth";

function unauthorizedResponse() {
  const response = NextResponse.json({ status: 401, message: "Authentication required" }, { status: 401 });
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    maxAge: 0,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const session = decodeSessionCookie(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  if (!session) {
    return unauthorizedResponse();
  }

  const url = new URL(request.url);
  const query = new URLSearchParams();

  const passthroughKeys = ["page", "page_size", "search", "pinned", "sort_by", "sort_order"];
  for (const key of passthroughKeys) {
    const value = url.searchParams.get(key);
    if (value !== null && value !== "") {
      query.set(key, value);
    }
  }

  const backendUrl = `${getBackendApiUrl()}/api/v1/files${query.toString() ? `?${query.toString()}` : ""}`;

  const backendResponse = await fetch(backendUrl, {
    method: "GET",
    headers: {
      "X-API-Key": session.apiKey,
    },
    cache: "no-store",
  });

  if (backendResponse.status === 401) {
    return unauthorizedResponse();
  }

  const payload = (await backendResponse.json().catch(() => null)) as
    | {
        status?: number;
        message?: string;
        data?: unknown;
        meta?: unknown;
      }
    | null;

  if (!backendResponse.ok) {
    return NextResponse.json(
      {
        status: backendResponse.status,
        message: payload?.message ?? "Failed to fetch files",
      },
      { status: backendResponse.status },
    );
  }

  return NextResponse.json(
    {
      status: 200,
      message: payload?.message ?? "Files fetched successfully",
      data: payload?.data ?? [],
      meta: payload?.meta ?? null,
    },
    { status: 200 },
  );
}
