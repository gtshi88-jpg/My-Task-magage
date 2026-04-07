import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidShareToken } from "@/lib/share/validate-token";
import { taskToRow } from "@/lib/tasks/db-map";
import type { Task } from "@/lib/types/task";

function getToken(request: NextRequest): string | null {
  return request.headers.get("x-share-token");
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const token = getToken(request);
  if (!(await isValidShareToken(token))) {
    return NextResponse.json({ error: "Invalid or missing share token" }, { status: 401 });
  }
  const { id } = await context.params;
  try {
    const body = (await request.json()) as Task;
    if (body.id !== id) {
      return NextResponse.json({ error: "ID mismatch" }, { status: 400 });
    }
    const admin = createAdminClient();
    const { error } = await admin
      .from("tasks")
      .update(taskToRow(body))
      .eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const token = getToken(request);
  if (!(await isValidShareToken(token))) {
    return NextResponse.json({ error: "Invalid or missing share token" }, { status: 401 });
  }
  const { id } = await context.params;
  try {
    const admin = createAdminClient();
    const { error } = await admin.from("tasks").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}
