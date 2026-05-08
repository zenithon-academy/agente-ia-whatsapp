import { NextResponse } from "next/server";
import { SESSION_COOKIE, createSession } from "@/lib/auth";

export async function POST(request: Request) {
  const { password } = await request.json();

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = createSession();
  const response = NextResponse.json({ ok: true });
  response.headers.set(
    "Set-Cookie",
    `${SESSION_COOKIE}=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`
  );
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.headers.set(
    "Set-Cookie",
    `${SESSION_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`
  );
  return response;
}
