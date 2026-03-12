import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  callBackend,
  decodeSessionCookie,
  encodeSessionCookie,
  getSessionMaxAgeSeconds,
  SESSION_COOKIE_NAME,
} from "@/lib/server-auth";

type RenewRequest = {
  action?: "challenge" | "confirm";
  verificationCode?: string;
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

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = decodeSessionCookie(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  if (!session) {
    return unauthorizedResponse();
  }

  const payload = (await request.json().catch(() => null)) as RenewRequest | null;
  const action = payload?.action;

  if (action === "challenge") {
    const challenge = await callBackend<never>("/api/v1/users/renew/challenge", {
      method: "POST",
      apiKey: session.apiKey,
    });

    return NextResponse.json(
      {
        status: challenge.status,
        message: challenge.body?.message ?? (challenge.ok ? "Verification code requested" : "Challenge request failed"),
      },
      { status: challenge.status },
    );
  }

  if (action === "confirm") {
    const verificationCode = payload?.verificationCode?.trim();
    if (!verificationCode) {
      return NextResponse.json({ status: 422, message: "verificationCode is required" }, { status: 422 });
    }

    const renew = await callBackend<{ api_key: string }>("/api/v1/users/renew", {
      method: "POST",
      apiKey: session.apiKey,
      body: JSON.stringify({ verification_code: verificationCode }),
    });

    if (!renew.ok || !renew.body?.data?.api_key) {
      return NextResponse.json(
        { status: renew.status, message: renew.body?.message ?? "API key renewal failed" },
        { status: renew.status },
      );
    }

    const response = NextResponse.json({
      status: 200,
      message: "API key renewed",
      data: {
        newApiKey: renew.body.data.api_key,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: encodeSessionCookie({
        email: session.email,
        apiKey: renew.body.data.api_key,
        createdAt: new Date().toISOString(),
      }),
      maxAge: getSessionMaxAgeSeconds(),
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  }

  return NextResponse.json({ status: 422, message: "action must be challenge or confirm" }, { status: 422 });
}
