import type { TaskStatus } from "@/lib/types/task";

export const STATUS_ORDER: TaskStatus[] = [
  "not_started",
  "in_progress",
  "done",
];

export const STATUS_LABEL: Record<TaskStatus, string> = {
  not_started: "未着手",
  in_progress: "進行中",
  done: "完了",
};

/** dnd-kit / column id は status と同一 */
export function statusToColumnId(status: TaskStatus): string {
  return status;
}

export function columnIdToStatus(columnId: string): TaskStatus | null {
  if (
    columnId === "not_started" ||
    columnId === "in_progress" ||
    columnId === "done"
  ) {
    return columnId;
  }
  return null;
}
