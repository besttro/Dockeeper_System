// src/lib/auth.ts
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret-change-me");

export async function getCurrentUserId(): Promise<number | null> {
  // ✅ Next.js 15: cookies() is async
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    const uid = (payload as any).uid;
    return typeof uid === "number" ? uid : null;
  } catch {
    return null;
  }
}

