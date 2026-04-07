import { toIsoDateString } from "@/lib/calendar-utils";
import type { Task } from "@/lib/types/task";

/** 親タスクのみ。納期が今日より前で、かつ未完了のとき期限切れ */
export function isTaskOverdue(task: Task): boolean {
  if (task.parentId != null) return false;
  if (task.status === "done") return false;
  if (!task.dueDate) return false;
  const today = toIsoDateString(new Date());
  return task.dueDate < today;
}
