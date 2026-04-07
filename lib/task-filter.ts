import { isTaskOverdue } from "@/lib/due-status";
import type { Task, TaskStatus } from "@/lib/types/task";

function matchesQuery(t: Task, q: string): boolean {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  return (
    t.title.toLowerCase().includes(s) ||
    t.senderName.toLowerCase().includes(s) ||
    t.receiverName.toLowerCase().includes(s) ||
    t.description.toLowerCase().includes(s)
  );
}

/**
 * 検索に一致する親タスクと、その子タスクだけに絞る（ボード・カレンダー表示用）
 */
export function filterTasksForDisplay(tasks: Task[], query: string): Task[] {
  const q = query.trim();
  if (!q) return tasks;
  const visibleRootIds = new Set(
    tasks
      .filter((t) => t.parentId == null && matchesQuery(t, q))
      .map((t) => t.id),
  );
  return tasks.filter(
    (t) =>
      (t.parentId == null && visibleRootIds.has(t.id)) ||
      (t.parentId != null && visibleRootIds.has(t.parentId)),
  );
}

function filterByStatus(
  tasks: Task[],
  statusFilter: TaskStatus,
): Task[] {
  const rootIds = new Set(
    tasks
      .filter((t) => t.parentId == null && t.status === statusFilter)
      .map((t) => t.id),
  );
  return tasks.filter(
    (t) =>
      (t.parentId == null && rootIds.has(t.id)) ||
      (t.parentId != null && rootIds.has(t.parentId)),
  );
}

function filterByOverdue(tasks: Task[]): Task[] {
  const rootIds = new Set(
    tasks
      .filter((t) => t.parentId == null && isTaskOverdue(t))
      .map((t) => t.id),
  );
  return tasks.filter(
    (t) =>
      (t.parentId == null && rootIds.has(t.id)) ||
      (t.parentId != null && rootIds.has(t.parentId)),
  );
}

/**
 * 検索・ステータス・期限切れのみ、を AND で適用
 */
export function filterTasksForUI(
  tasks: Task[],
  query: string,
  statusFilter: TaskStatus | null,
  overdueOnly: boolean,
): Task[] {
  let result = filterTasksForDisplay(tasks, query);
  if (statusFilter) {
    result = filterByStatus(result, statusFilter);
  }
  if (overdueOnly) {
    result = filterByOverdue(result);
  }
  return result;
}
