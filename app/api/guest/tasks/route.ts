import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidShareToken } from "@/lib/share/validate-token";
import { rowToTask, taskToRow } from "@/lib/tasks/db-map";
import type { Task } from "@/lib/types/task";

function getToken(request: NextRequest): string | null {
  return request.headers.get("x-share-token");
}

export async function GET(request: NextRequest) {
  const token = getToken(request);
  if (!(await isValidShareToken(token))) {
    return NextResponse.json({ error: "Invalid or missing share token" }, { status: 401 });
  }
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from("tasks").select("*");
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const tasks = (data ?? []).map((row) =>
      rowToTask(row as Record<string, unknown>),
    );
    return NextResponse.json({ tasks });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const token = getToken(request);
  if (!(await isValidShareToken(token))) {
    return NextResponse.json({ error: "Invalid or missing share token" }, { status: 401 });
  }
  try {
    const body = (await request.json()) as Task;
    const admin = createAdminClient();
    const { error } = await admin.from("tasks").insert(taskToRow(body));
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}

export async function PUT(request: NextRequest) {
  const token = getToken(request);
  if (!(await isValidShareToken(token))) {
    return NextResponse.json({ error: "Invalid or missing share token" }, { status: 401 });
  }
  try {
    const body = (await request.json()) as { tasks: Task[] };
    if (!Array.isArray(body.tasks)) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const admin = createAdminClient();
    const rows = body.tasks.map(taskToRow);
    const { error } = await admin.from("tasks").upsert(rows, { onConflict: "id" });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}
