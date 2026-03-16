import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  callBackend,
  decodeSessionCookie,
  SESSION_COOKIE_NAME,
  type BackendStatusData,
} from "@/lib/server-auth";

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

export async function GET() {
  const cookieStore = await cookies();
  const session = decodeSessionCookie(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  if (!session) {
    return unauthorizedResponse();
  }

  const backend = await callBackend<BackendStatusData>("/api/v1/users/status", {
    method: "POST",
    apiKey: session.apiKey,
  });

  if (!backend.ok || !backend.body?.data) {
    return unauthorizedResponse();
  }

  const statusData = backend.body.data;

  return NextResponse.json({
    status: 200,
    message: "Dashboard overview fetched",
    data: {
      account: {
        email: session.email,
        apiKeyStatus: statusData.api_key_status,
        createdAt: statusData.created_at,
        lastRenewedAt: statusData.last_renewed_at,
      },
      usage: {
        requestCount: statusData.usage_count,
        fileCount: null,
        storageUsedBytes: null,
      },
      recentFiles: [],
      capabilities: {
        renewApiKey: true,
        revokeApiKey: true,
        recentFilesAvailable: false,
      },
    },
  });
}
