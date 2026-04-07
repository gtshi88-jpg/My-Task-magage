"use client";

import { useMemo } from "react";
import { STATUS_LABEL } from "@/lib/constants/status";
import { isTaskOverdue } from "@/lib/due-status";
import type { Task } from "@/lib/types/task";
import { tasksByParentId } from "@/lib/task-board";
import { formatDueDate } from "@/lib/format";

type TaskListViewProps = {
  tasks: Task[];
  onOpenTask: (task: Task) => void;
};

export function TaskListView({ tasks, onOpenTask }: TaskListViewProps) {
  const rows = useMemo(() => {
    const roots = tasks.filter((t) => t.parentId == null);
    return [...roots].sort((a, b) => {
      if (!a.dueDate && !b.dueDate) {
        return a.title.localeCompare(b.title, "ja");
      }
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      const c = a.dueDate.localeCompare(b.dueDate);
      if (c !== 0) return c;
      return a.title.localeCompare(b.title, "ja");
    });
  }, [tasks]);

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col overflow-hidden p-3 sm:p-4 md:p-5">
      <div className="overflow-auto rounded-xl border border-white/25 bg-white/92 shadow-2xl shadow-black/30 ring-1 ring-white/20 backdrop-blur-md">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="sticky top-0 z-10 border-b border-zinc-200 bg-gradient-to-r from-zinc-50 to-zinc-100/90">
              <th className="whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wide text-zinc-500">
                タスク
              </th>
              <th className="whitespace-nowrap px-3 py-3 text-xs font-bold uppercase tracking-wide text-zinc-500">
                ステータス
              </th>
              <th className="whitespace-nowrap px-3 py-3 text-xs font-bold uppercase tracking-wide text-zinc-500">
                優先度
              </th>
              <th className="whitespace-nowrap px-3 py-3 text-xs font-bold uppercase tracking-wide text-zinc-500">
                納期
              </th>
              <th className="whitespace-nowrap px-3 py-3 text-xs font-bold uppercase tracking-wide text-zinc-500">
                依頼
              </th>
              <th className="whitespace-nowrap px-3 py-3 text-xs font-bold uppercase tracking-wide text-zinc-500">
                改修
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-sm text-zinc-400"
                >
                  表示するタスクがありません
                </td>
              </tr>
            ) : (
              rows.map((task) => {
                const subs = tasksByParentId(tasks, task.id);
                const done = subs.filter((s) => s.status === "done").length;
                const overdue = isTaskOverdue(task);
                return (
                  <tr
                    key={task.id}
                    className={[
                      "cursor-pointer border-b border-zinc-100 transition hover:bg-sky-50/60",
                      overdue ? "bg-red-50/40" : "even:bg-zinc-50/40",
                    ].join(" ")}
                    onClick={() => onOpenTask(task)}
                  >
                    <td className="max-w-[min(40vw,22rem)] px-4 py-2.5">
                      <span className="line-clamp-2 font-medium text-zinc-900">
                        {task.title}
                      </span>
                      {overdue ? (
                        <span className="mt-1 inline-block rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800 ring-1 ring-red-200">
                          期限切れ
                        </span>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-xs text-zinc-700">
                      {STATUS_LABEL[task.status]}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">
                      <span className="inline-flex rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-800 ring-1 ring-zinc-200/80">
                        {task.priority}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-xs tabular-nums text-zinc-700">
                      {overdue ? (
                        <span className="font-semibold text-red-700">
                          {formatDueDate(task.dueDate)}
                        </span>
                      ) : (
                        formatDueDate(task.dueDate)
                      )}
                    </td>
                    <td className="max-w-[10rem] truncate px-3 py-2.5 text-xs text-zinc-600">
                      {task.senderName || "—"} → {task.receiverName || "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-xs tabular-nums text-zinc-600">
                      {subs.length > 0 ? `${done}/${subs.length}` : "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
