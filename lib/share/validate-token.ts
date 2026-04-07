import { timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

function timingSafeEqualString(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** 共有トークンが DB の値と一致するか（サーバー専用） */
export async function isValidShareToken(
  token: string | null,
): Promise<boolean> {
  if (!token?.trim()) return false;
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("board_share")
      .select("token")
      .eq("id", 1)
      .maybeSingle();
    if (error || !data?.token) return false;
    return timingSafeEqualString(token.trim(), data.token);
  } catch {
    return false;
  }
}
