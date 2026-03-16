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

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = decodeSessionCookie(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  if (!session) {
    return unauthorizedResponse();
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ status: 400, message: "No file provided" }, { status: 400 });
  }

  const backendFormData = new FormData();
  backendFormData.append("file", file, file.name);

  const backendResponse = await fetch(`${getBackendApiUrl()}/api/v1/files/upload`, {
    method: "POST",
    headers: {
      "X-API-Key": session.apiKey,
    },
    body: backendFormData,
    cache: "no-store",
  });

  const payload = (await backendResponse.json().catch(() => null)) as
    | {
        message?: string;
        data?: {
          cid?: string;
          original_filename?: string;
          size?: number;
          uploaded_at?: string;
          pinned?: boolean;
          task_id?: string;
          status_url?: string;
        };
      }
    | null;

  if (backendResponse.status === 401) {
    return unauthorizedResponse();
  }

  if (!backendResponse.ok) {
    return NextResponse.json(
      { status: backendResponse.status, message: payload?.message ?? "Upload failed" },
      { status: backendResponse.status },
    );
  }

  if (backendResponse.status === 202 && payload?.data?.task_id) {
    return NextResponse.json(
      {
        status: 202,
        message: payload.message ?? "File upload queued",
        data: {
          mode: "async",
          taskId: payload.data.task_id,
          statusUrl: `/api/upload/status/${payload.data.task_id}`,
        },
      },
      { status: 202 },
    );
  }

  return NextResponse.json(
    {
      status: backendResponse.status,
      message: payload?.message ?? "File uploaded successfully",
      data: {
        mode: "direct",
        cid: payload?.data?.cid,
        originalFilename: payload?.data?.original_filename ?? file.name,
        size: payload?.data?.size ?? file.size,
        uploadedAt: payload?.data?.uploaded_at,
        pinned: payload?.data?.pinned,
      },
    },
    { status: backendResponse.status },
  );
}