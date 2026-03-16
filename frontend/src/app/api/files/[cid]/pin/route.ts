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

export async function POST(request: Request, { params }: { params: Promise<{ cid: string }> }) {
  const cookieStore = await cookies();
  const session = decodeSessionCookie(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  if (!session) {
    return unauthorizedResponse();
  }

  const body = (await request.json().catch(() => null)) as { targetPinned?: boolean } | null;
  if (typeof body?.targetPinned !== "boolean") {
    return NextResponse.json({ status: 422, message: "targetPinned boolean is required" }, { status: 422 });
  }

  const { cid: rawCid } = await params;
  const normalizedCid = await normalizeCid(rawCid);
  if (!normalizedCid) {
    return NextResponse.json({ status: 422, message: "Invalid CID format" }, { status: 422 });
  }

  const actionPath = body.targetPinned ? "pin" : "unpin";

  const backendResponse = await fetch(`${getBackendApiUrl()}/api/v1/files/${actionPath}/${encodeURIComponent(normalizedCid)}`, {
    method: "POST",
    headers: {
      "X-API-Key": session.apiKey,
    },
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
        message: payload?.message ?? "Unable to update pin status",
      },
      { status: backendResponse.status },
    );
  }

  return NextResponse.json(
    {
      status: backendResponse.status,
      message: payload?.message ?? (body.targetPinned ? "Pin request queued" : "Unpin request queued"),
      data: payload?.data ?? null,
    },
    { status: backendResponse.status },
  );
}
