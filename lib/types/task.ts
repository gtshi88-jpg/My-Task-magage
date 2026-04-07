export type TaskStatus = "not_started" | "in_progress" | "done";

export type Priority = "高" | "中" | "低";

export type Task = {
  id: string;
  /** 親タスク ID。null のときボード上の親タスク */
  parentId: string | null;
  title: string;
  senderName: string;
  receiverName: string;
  priority: Priority;
  /** ISO date string (yyyy-mm-dd) or null */
  dueDate: string | null;
  status: TaskStatus;
  /** Sort order within the same status (lower first) */
  order: number;
  description: string;
};
