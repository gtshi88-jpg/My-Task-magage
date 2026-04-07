"use client";

import { useState } from "react";
import { STATUS_LABEL } from "@/lib/constants/status";
import { tasksByParentId } from "@/lib/task-board";
import type { Priority, Task, TaskStatus } from "@/lib/types/task";

type TaskDetailPanelProps = {
  allTasks: Task[];
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, patch: Partial<Task>) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
  addTask: (d?: {
    status?: TaskStatus;
    title?: string;
    parentId?: string;
  }) => void | Promise<void>;
  updateTask: (id: string, patch: Partial<Task>) => void | Promise<void>;
  deleteSubtask: (id: string) => void | Promise<void>;
};

const priorities: Priority[] = ["高", "中", "低"];
const statuses: TaskStatus[] = ["not_started", "in_progress", "done"];

type TaskDetailFormProps = {
  allTasks: Task[];
  task: Task;
  onClose: () => void;
  onSave: (id: string, patch: Partial<Task>) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
  addTask: TaskDetailPanelProps["addTask"];
  updateTask: TaskDetailPanelProps["updateTask"];
  deleteSubtask: TaskDetailPanelProps["deleteSubtask"];
};

function TaskDetailForm({
  allTasks,
  task,
  onClose,
  onSave,
  onDelete,
  addTask,
  updateTask,
  deleteSubtask,
}: TaskDetailFormProps) {
  const [draft, setDraft] = useState(() => ({ ...task }));
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  const update = (patch: Partial<Task>) => {
    setDraft((d) => ({ ...d, ...patch }));
  };

  const handleSave = async () => {
    if (!draft.title?.trim()) return;
    await onSave(task.id, {
      title: draft.title.trim(),
      senderName: draft.senderName ?? "",
      receiverName: draft.receiverName ?? "",
      priority: draft.priority ?? "中",
      dueDate: draft.dueDate ?? null,
      status: draft.status ?? task.status,
      description: draft.description ?? "",
    });
    onClose();
  };

  return (
    <aside
      className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[min(92vw,760px)] flex-col border-l border-zinc-200/80 bg-white/95 shadow-2xl shadow-slate-900/10 backdrop-blur-md lg:max-w-[50vw]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-detail-title"
    >
      <div className="flex items-start justify-between gap-3 border-b border-zinc-100 px-5 py-4">
        <h2
          id="task-detail-title"
          className="text-lg font-semibold leading-snug text-zinc-900"
        >
          タスクの詳細
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
          aria-label="閉じる"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-zinc-500">
            タスク名
          </span>
          <input
            value={draft.title ?? ""}
            onChange={(e) => update({ title: e.target.value })}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-base font-semibold text-zinc-900 outline-none ring-zinc-400 focus:ring-2"
          />
        </label>

        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-zinc-500">
                依頼元
              </span>
              <input
                value={draft.senderName ?? ""}
                onChange={(e) => update({ senderName: e.target.value })}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none ring-zinc-400 focus:ring-2"
                placeholder="名前"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-zinc-500">
                依頼先
              </span>
              <input
                value={draft.receiverName ?? ""}
                onChange={(e) => update({ receiverName: e.target.value })}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none ring-zinc-400 focus:ring-2"
                placeholder="名前"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-zinc-500">
              ステータス
            </span>
            <select
              value={draft.status ?? task.status}
              onChange={(e) => update({ status: e.target.value as TaskStatus })}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none ring-zinc-400 focus:ring-2"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-zinc-500">
              納期
            </span>
            <input
              type="date"
              value={draft.dueDate ?? ""}
              onChange={(e) => update({ dueDate: e.target.value || null })}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none ring-zinc-400 focus:ring-2"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-zinc-500">
              優先度
            </span>
            <select
              value={draft.priority ?? "中"}
              onChange={(e) =>
                update({ priority: e.target.value as Priority })
              }
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none ring-zinc-400 focus:ring-2"
            >
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-zinc-500">
              メモ
            </span>
            <textarea
              value={draft.description ?? ""}
              onChange={(e) => update({ description: e.target.value })}
              rows={5}
              className="w-full resize-y rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none ring-zinc-400 focus:ring-2"
              placeholder="詳細やメモを入力..."
            />
          </label>

          {task.parentId == null ? (
            <div className="border-t border-zinc-100 pt-4">
              <span className="mb-2 block text-xs font-medium text-zinc-500">
                改修チェックリスト
              </span>
              <ul className="mb-3 space-y-2">
                {tasksByParentId(allTasks, task.id).map((c) => (
                  <li
                    key={c.id}
                    className="flex items-start gap-2 rounded-lg border border-zinc-100 bg-zinc-50/80 p-2"
                  >
                    <input
                      type="checkbox"
                      checked={c.status === "done"}
                      onChange={() =>
                        void updateTask(c.id, {
                          status:
                            c.status === "done" ? "not_started" : "done",
                        })
                      }
                      className="mt-1 h-4 w-4 shrink-0 rounded border-zinc-300 text-sky-600 focus:ring-sky-500"
                    />
                    <textarea
                      key={`${c.id}-${c.title}`}
                      defaultValue={c.title}
                      rows={2}
                      onBlur={(e) => {
                        const v = e.target.value.trim();
                        if (v && v !== c.title) {
                          void updateTask(c.id, { title: v });
                        }
                      }}
                      className="min-w-0 flex-1 resize-y rounded border border-transparent bg-transparent px-1 py-0.5 text-sm leading-snug text-zinc-900 outline-none focus:border-zinc-200"
                    />
                    <button
                      type="button"
                      onClick={() => void deleteSubtask(c.id)}
                      className="shrink-0 rounded p-1 text-zinc-400 hover:bg-zinc-200 hover:text-red-600"
                      aria-label="削除"
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
              <div className="flex gap-2">
                <input
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const t = newSubtaskTitle.trim();
                      if (!t) return;
                      void addTask({ parentId: task.id, title: t });
                      setNewSubtaskTitle("");
                    }
                  }}
                  placeholder="改修項目を追加…"
                  className="min-w-0 flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none ring-zinc-400 focus:ring-2"
                />
                <button
                  type="button"
                  onClick={() => {
                    const t = newSubtaskTitle.trim();
                    if (!t) return;
                    void addTask({ parentId: task.id, title: t });
                    setNewSubtaskTitle("");
                  }}
                  className="shrink-0 rounded-lg bg-zinc-200 px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-300"
                >
                  追加
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-zinc-100 px-5 py-4">
        {onDelete && (
          <button
            type="button"
            onClick={async () => {
              await Promise.resolve(onDelete(task.id));
              onClose();
            }}
            className="mr-auto rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            削除
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          キャンセル
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!draft.title?.trim()}
          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-40"
        >
          保存
        </button>
      </div>
    </aside>
  );
}

export function TaskDetailPanel({
  allTasks,
  task,
  open,
  onClose,
  onSave,
  onDelete,
  addTask,
  updateTask,
  deleteSubtask,
}: TaskDetailPanelProps) {
  if (!open || !task) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-slate-900/35 backdrop-blur-sm"
        aria-label="パネルを閉じる"
        onClick={onClose}
      />
      <TaskDetailForm
        key={task.id}
        allTasks={allTasks}
        task={task}
        onClose={onClose}
        onSave={onSave}
        onDelete={onDelete}
        addTask={addTask}
        updateTask={updateTask}
        deleteSubtask={deleteSubtask}
      />
    </>
  );
}
