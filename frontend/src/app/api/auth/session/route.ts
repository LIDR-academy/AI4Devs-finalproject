import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  callBackend,
  decodeSessionCookie,
  encodeSessionCookie,
  getSessionMaxAgeSeconds,
  SESSION_COOKIE_NAME,
  type BackendStatusData,
} from "@/lib/server-auth";

function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    maxAge: 0,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as { email?: string; apiKey?: string } | null;

  const email = payload?.email?.trim();
  const apiKey = payload?.apiKey?.trim();

  if (!email || !apiKey) {
    return NextResponse.json({ status: 422, message: "Email and API key are required" }, { status: 422 });
  }

  const backend = await callBackend<BackendStatusData>("/api/v1/users/status", {
    method: "POST",
    apiKey,
  });

  if (!backend.ok || !backend.body?.data) {
    return NextResponse.json(
      { status: 401, message: backend.body?.message ?? "Invalid API key" },
      { status: 401 },
    );
  }

  const response = NextResponse.json({
    status: 200,
    message: "Session created",
    data: {
      email,
      apiKeyStatus: backend.body.data.api_key_status,
      createdAt: backend.body.data.created_at,
      lastRenewedAt: backend.body.data.last_renewed_at,
      usageCount: backend.body.data.usage_count,
    },
  });

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: encodeSessionCookie({ email, apiKey, createdAt: new Date().toISOString() }),
    maxAge: getSessionMaxAgeSeconds(),
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
    return NextResponse.json({ status: 401, message: "No active session" }, { status: 401 });
  }

  const backend = await callBackend<BackendStatusData>("/api/v1/users/status", {
    method: "POST",
    apiKey: session.apiKey,
  });

  if (!backend.ok || !backend.body?.data) {
    const response = NextResponse.json({ status: 401, message: "Session expired" }, { status: 401 });
    clearSessionCookie(response);
    return response;
  }

  return NextResponse.json({
    status: 200,
    message: "Session active",
    data: {
      email: session.email,
      apiKeyStatus: backend.body.data.api_key_status,
      createdAt: backend.body.data.created_at,
      lastRenewedAt: backend.body.data.last_renewed_at,
      usageCount: backend.body.data.usage_count,
    },
  });
}

export async function DELETE() {
  const response = NextResponse.json({ status: 200, message: "Logged out" });
  clearSessionCookie(response);
  return response;
}
