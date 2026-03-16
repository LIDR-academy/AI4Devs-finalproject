import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { decodeSessionCookie, getBackendApiUrl, SESSION_COOKIE_NAME } from "@/lib/server-auth";

type RouteContext = {
  params: Promise<{ taskId: string }>;
};

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

export async function GET(_request: Request, context: RouteContext) {
  const { taskId } = await context.params;

  const cookieStore = await cookies();
  const session = decodeSessionCookie(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  if (!session) {
    return unauthorizedResponse();
  }

  const backendResponse = await fetch(`${getBackendApiUrl()}/api/v1/files/upload/status/${taskId}`, {
    method: "GET",
    headers: {
      "X-API-Key": session.apiKey,
    },
    cache: "no-store",
  });

  const payload = (await backendResponse.json().catch(() => null)) as
    | {
        message?: string;
        data?: {
          task_id?: string;
          state?: string;
          progress?: number;
          message?: string;
          result?: {
            status?: string;
            cid?: string;
            filename?: string;
            size?: number;
          };
        };
      }
    | null;

  if (backendResponse.status === 401) {
    return unauthorizedResponse();
  }

  if (!backendResponse.ok || !payload?.data) {
    return NextResponse.json(
      { status: backendResponse.status, message: payload?.message ?? "Unable to read upload status" },
      { status: backendResponse.status },
    );
  }

  const state = payload.data.state ?? "PENDING";
  const progress = payload.data.progress ?? 0;
  const result = payload.data.result;

  if (state === "SUCCESS" && result?.status === "failed") {
    return NextResponse.json({ status: 500, message: result.filename ?? "Upload failed" }, { status: 500 });
  }

  if (state === "SUCCESS" && result?.cid) {
    return NextResponse.json({
      status: 200,
      message: payload.message ?? "Upload completed",
      data: {
        taskId: payload.data.task_id ?? taskId,
        phase: "done",
        progress: 100,
        result: {
          cid: result.cid,
          originalFilename: result.filename ?? "uploaded-file",
          size: result.size ?? 0,
        },
      },
    });
  }

  return NextResponse.json({
    status: 200,
    message: payload.data.message ?? payload.message ?? "Upload still processing",
    data: {
      taskId: payload.data.task_id ?? taskId,
      phase: state === "PENDING" ? "pending" : "in_progress",
      progress,
      message: payload.data.message,
    },
  });
}