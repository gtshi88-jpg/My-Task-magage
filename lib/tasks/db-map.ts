import type { Priority, Task, TaskStatus } from "@/lib/types/task";

/** DB row shape (public.tasks) */
export type TaskRow = {
  id: string;
  parent_id: string | null;
  title: string;
  sender_name: string;
  receiver_name: string;
  priority: string;
  due_date: string | null;
  status: string;
  sort_order: number;
  description: string | null;
};

function isPriority(v: string): v is Priority {
  return v === "高" || v === "中" || v === "低";
}

function isTaskStatus(v: string): v is TaskStatus {
  return v === "not_started" || v === "in_progress" || v === "done";
}

export function rowToTask(row: TaskRow | Record<string, unknown>): Task {
  const r = row as TaskRow;
  const priorityRaw = String(r.priority ?? "");
  const statusRaw = String(r.status ?? "");
  const priority: Priority = isPriority(priorityRaw) ? priorityRaw : "中";
  const status: TaskStatus = isTaskStatus(statusRaw) ? statusRaw : "not_started";
  const rawParent = (row as Record<string, unknown>).parent_id;
  return {
    id: String(r.id),
    parentId: rawParent == null ? null : String(rawParent),
    title: String(r.title ?? ""),
    senderName: String(r.sender_name ?? ""),
    receiverName: String(r.receiver_name ?? ""),
    priority,
    dueDate: r.due_date ? String(r.due_date).slice(0, 10) : null,
    status,
    order: Number(r.sort_order ?? 0),
    description: String(r.description ?? ""),
  };
}

export function taskToRow(t: Task): TaskRow {
  return {
    id: t.id,
    parent_id: t.parentId,
    title: t.title,
    sender_name: t.senderName,
    receiver_name: t.receiverName,
    priority: t.priority,
    due_date: t.dueDate,
    status: t.status,
    sort_order: t.order,
    description: t.description,
  };
}
