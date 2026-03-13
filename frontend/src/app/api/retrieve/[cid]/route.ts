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

export async function GET(request: Request, { params }: { params: Promise<{ cid: string }> }) {
  const cookieStore = await cookies();
  const session = decodeSessionCookie(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  if (!session) {
    return unauthorizedResponse();
  }

  const { cid: rawCid } = await params;
  const normalizedCid = await normalizeCid(rawCid);
  if (!normalizedCid) {
    return NextResponse.json({ status: 422, message: "Invalid CID format" }, { status: 422 });
  }

  const url = new URL(request.url);
  const backendQuery = new URLSearchParams();
  if (url.searchParams.has("download")) {
    backendQuery.set("download", url.searchParams.get("download") || "1");
  }

  const backendUrl = `${getBackendApiUrl()}/api/v1/files/retrieve/${encodeURIComponent(normalizedCid)}${backendQuery.toString() ? `?${backendQuery.toString()}` : ""}`;

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

  if (!backendResponse.ok) {
    const payload = (await backendResponse.json().catch(() => null)) as { message?: string } | null;
    return NextResponse.json(
      {
        status: backendResponse.status,
        message: payload?.message ?? "Failed to retrieve file",
      },
      { status: backendResponse.status },
    );
  }

  const responseBody = await backendResponse.arrayBuffer();

  const response = new NextResponse(responseBody, {
    status: 200,
    headers: {
      "Cache-Control": backendResponse.headers.get("cache-control") ?? "no-store",
      "Content-Disposition": backendResponse.headers.get("content-disposition") ?? `inline; filename="${normalizedCid}.bin"`,
      "Content-Type": backendResponse.headers.get("content-type") ?? "application/octet-stream",
      ETag: backendResponse.headers.get("etag") ?? `"${normalizedCid}"`,
    },
  });

  const contentLength = backendResponse.headers.get("content-length");
  if (contentLength) {
    response.headers.set("Content-Length", contentLength);
  } else {
    response.headers.set("Content-Length", String(responseBody.byteLength));
  }

  const lastModified = backendResponse.headers.get("last-modified");
  if (lastModified) {
    response.headers.set("Last-Modified", lastModified);
  }

  return response;
}
