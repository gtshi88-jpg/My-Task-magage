"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toIsoDateString } from "@/lib/calendar-utils";
import { isTaskOverdue } from "@/lib/due-status";
import type { Task, TaskStatus } from "@/lib/types/task";
import { tasksByParentId } from "@/lib/task-board";
import { formatDueDate } from "@/lib/format";
import { initialsFromName } from "@/lib/initials";

function RoleAvatars({
  senderName,
  receiverName,
}: {
  senderName: string;
  receiverName: string;
}) {
  const s = senderName.trim() ? initialsFromName(senderName) : "—";
  const r = receiverName.trim() ? initialsFromName(receiverName) : "—";
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <span
        title={
          senderName.trim() ? `依頼元: ${senderName}` : "依頼元 未設定"
        }
        className="flex h-7 w-7 items-center justify-center rounded-full border border-white/90 bg-gradient-to-br from-slate-500 to-slate-700 text-[10px] font-bold text-white shadow-sm"
      >
        {s}
      </span>
      <span className="px-0.5 text-[10px] text-zinc-300" aria-hidden>
        →
      </span>
      <span
        title={
          receiverName.trim() ? `依頼先: ${receiverName}` : "依頼先 未設定"
        }
        className="flex h-7 w-7 items-center justify-center rounded-full border border-white/90 bg-gradient-to-br from-sky-500 to-sky-700 text-[10px] font-bold text-white shadow-sm"
      >
        {r}
      </span>
    </div>
  );
}

const priorityClass: Record<Task["priority"], string> = {
  高: "bg-red-50 text-red-800 ring-red-100",
  中: "bg-amber-50 text-amber-900 ring-amber-100",
  低: "bg-zinc-100 text-zinc-700 ring-zinc-200",
};

function DueDatePill({ task }: { task: Task }) {
  const today = toIsoDateString(new Date());
  const { dueDate } = task;
  const overdue = isTaskOverdue(task);
  const clockIcon = (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
  if (!dueDate) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100/90 px-2 py-0.5 text-[10px] font-semibold text-zinc-500 ring-1 ring-zinc-200/80">
        {clockIcon}
        納期未設定
      </span>
    );
  }
  if (overdue) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-900 ring-1 ring-inset ring-red-200">
        {clockIcon}
        期限切れ {formatDueDate(dueDate)}
      </span>
    );
  }
  const isToday = dueDate === today;
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset",
        isToday
          ? "bg-orange-100 text-orange-900 ring-orange-200"
          : "bg-teal-50 text-teal-900 ring-teal-100",
      ].join(" ")}
    >
      {clockIcon}
      {isToday ? "今日" : formatDueDate(dueDate)}
    </span>
  );
}

type TaskCardProps = {
  task: Task;
  tasks: Task[];
  onOpen: (task: Task) => void;
  addTask: (d?: {
    status?: TaskStatus;
    title?: string;
    parentId?: string;
  }) => void | Promise<void>;
  updateTask: (id: string, patch: Partial<Task>) => void | Promise<void>;
  deleteTask: (id: string) => void | Promise<void>;
};

export function TaskCard({
  task,
  tasks,
  onOpen,
  addTask,
  updateTask,
  deleteTask,
}: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [newLine, setNewLine] = useState("");

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const children = tasksByParentId(tasks, task.id);
  const doneCount = children.filter((c) => c.status === "done").length;
  const total = children.length;
  const overdue = isTaskOverdue(task);

  const requestLine =
    task.senderName || task.receiverName
      ? `${task.senderName || "—"} → ${task.receiverName || "—"}`
      : "依頼元・依頼先 未設定";

  const toggleChildDone = (c: Task) => {
    void updateTask(c.id, {
      status: c.status === "done" ? "not_started" : "done",
    });
  };

  const addSubtask = () => {
    const t = newLine.trim();
    if (!t) return;
    void addTask({ parentId: task.id, title: t });
    setNewLine("");
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        "touch-none rounded-2xl border bg-white p-3 shadow-lg shadow-slate-950/20 ring-1",
        overdue
          ? "border-red-200/90 ring-red-200/60 ring-2"
          : "border-white/80 ring-slate-900/5",
        "transition hover:border-sky-200/80 hover:shadow-lg",
        isDragging ? "opacity-40" : "opacity-100",
      ].join(" ")}
    >
      <div className="mb-2 flex items-start gap-2">
        <button
          type="button"
          className="mt-0.5 inline-flex h-8 w-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-md bg-zinc-100 text-zinc-500 active:cursor-grabbing"
          aria-label="ドラッグして移動"
          {...attributes}
          {...listeners}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
            <line x1="4" x2="4" y1="22" y2="15" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
          aria-expanded={expanded}
          aria-label={expanded ? "チェックリストを閉じる" : "チェックリストを開く"}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={expanded ? "rotate-180 transition" : "transition"}
            aria-hidden
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onOpen(task)}
          className="min-w-0 flex-1 rounded-lg text-left outline-none ring-zinc-400 focus-visible:ring-2"
        >
          <div className="flex items-start justify-between gap-2">
            <span className="line-clamp-2 font-semibold leading-snug text-zinc-900">
              {task.title}
            </span>
            <RoleAvatars
              senderName={task.senderName}
              receiverName={task.receiverName}
            />
          </div>
          <p className="mt-2 line-clamp-2 text-xs text-zinc-600">{requestLine}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <DueDatePill task={task} />
            <span
              className={[
                "inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset",
                priorityClass[task.priority],
              ].join(" ")}
            >
              {task.priority}
            </span>
            {total > 0 ? (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium tabular-nums text-zinc-600 ring-1 ring-zinc-200/80">
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </svg>
                {doneCount}/{total}
              </span>
            ) : null}
          </div>
        </button>
      </div>

      {expanded ? (
        <div className="border-t border-zinc-100 pt-2 pl-[4.25rem]">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
            改修チェックリスト
          </p>
          <ul className="space-y-1.5">
            {children.map((c) => (
              <li
                key={c.id}
                className="flex items-start gap-2 rounded-lg bg-zinc-50/80 px-2 py-1.5"
              >
                <input
                  type="checkbox"
                  checked={c.status === "done"}
                  onChange={() => toggleChildDone(c)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-zinc-300 text-sky-600 focus:ring-sky-500"
                  aria-label={`完了: ${c.title}`}
                />
                <span
                  className={[
                    "min-w-0 flex-1 text-xs leading-snug text-zinc-800",
                    c.status === "done" ? "text-zinc-400 line-through" : "",
                  ].join(" ")}
                >
                  {c.title}
                </span>
                <button
                  type="button"
                  onClick={() => void deleteTask(c.id)}
                  className="shrink-0 rounded p-1 text-zinc-400 hover:bg-zinc-200 hover:text-red-600"
                  aria-label="この項目を削除"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex gap-2">
            <input
              value={newLine}
              onChange={(e) => setNewLine(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSubtask();
                }
              }}
              placeholder="改修内容を追加…"
              className="min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs outline-none ring-zinc-400 focus:ring-2"
            />
            <button
              type="button"
              onClick={() => addSubtask()}
              className="shrink-0 rounded-lg bg-zinc-200 px-2 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-300"
            >
              追加
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
