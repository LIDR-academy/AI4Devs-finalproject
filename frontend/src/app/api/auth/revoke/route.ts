import { NextResponse } from "next/server";

// Backend currently exposes admin-only revoke endpoint.
// Keep this route explicit so the dashboard can surface a clear blocker.
export async function POST() {
  return NextResponse.json(
    {
      status: 501,
      message: "Self-service API key revocation is not available yet in backend endpoints.",
    },
    { status: 501 },
  );
}
