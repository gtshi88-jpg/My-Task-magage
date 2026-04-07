import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** ログイン済み管理者のみ。共有パス用トークンを返す。 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("board_share")
      .select("token")
      .eq("id", 1)
      .maybeSingle();

    if (error || !data?.token) {
      return NextResponse.json(
        { error: error?.message ?? "Share token not configured" },
        { status: 500 },
      );
    }

    return NextResponse.json({ token: data.token });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}
