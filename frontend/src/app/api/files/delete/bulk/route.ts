import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { normalizeCid } from "@/lib/cid";
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

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = decodeSessionCookie(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  if (!session) {
    return unauthorizedResponse();
  }

  const body = (await request.json().catch(() => null)) as { cids?: unknown } | null;
  if (!Array.isArray(body?.cids) || body.cids.length === 0) {
    return NextResponse.json({ status: 422, message: "At least one CID is required" }, { status: 422 });
  }

  const normalizedCids: string[] = [];
  for (const value of body.cids) {
    if (typeof value !== "string") {
      return NextResponse.json({ status: 422, message: "CID list must contain strings" }, { status: 422 });
    }
    const normalized = await normalizeCid(value);
    if (!normalized) {
      return NextResponse.json({ status: 422, message: `Invalid CID format: ${value}` }, { status: 422 });
    }
    normalizedCids.push(normalized);
  }

  const backendResponse = await fetch(`${getBackendApiUrl()}/api/v1/files/delete/bulk`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": session.apiKey,
    },
    body: JSON.stringify({ cids: normalizedCids }),
    cache: "no-store",
  });

  if (backendResponse.status === 401) {
    return unauthorizedResponse();
  }

  const payload = (await backendResponse.json().catch(() => null)) as { message?: string; data?: unknown } | null;

  if (!backendResponse.ok) {
    return NextResponse.json(
      {
        status: backendResponse.status,
        message: payload?.message ?? "Unable to delete files",
      },
      { status: backendResponse.status },
    );
  }

  return NextResponse.json(
    {
      status: backendResponse.status,
      message: payload?.message ?? "Bulk delete completed",
      data: payload?.data ?? null,
    },
    { status: backendResponse.status },
  );
}
