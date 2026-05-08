import { cookies } from "next/headers";

export const SESSION_COOKIE = "agent_session";

export function createSession(): string {
  const secret = process.env.NEXTAUTH_SECRET ?? "fallback-secret";
  const payload = `${Date.now()}.${secret}`;
  return Buffer.from(payload).toString("base64url");
}

export function validateSession(token: string): boolean {
  try {
    const secret = process.env.NEXTAUTH_SECRET ?? "fallback-secret";
    const decoded = Buffer.from(token, "base64url").toString();
    return decoded.endsWith(`.${secret}`);
  } catch {
    return false;
  }
}

export function isAuthenticated(request: Request): boolean {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`));
  if (!match) return false;
  return validateSession(decodeURIComponent(match[1]));
}

export async function isAuthenticatedServer(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  return validateSession(token);
}
