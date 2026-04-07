"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { STATUS_LABEL } from "@/lib/constants/status";
import { tasksInStatus } from "@/lib/task-board";
import type { Task, TaskStatus } from "@/lib/types/task";
import { TaskCard } from "./TaskCard";

const columnHeader: Record<TaskStatus, string> = {
  not_started:
    "bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 text-white shadow-inner ring-1 ring-white/15",
  in_progress:
    "bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 text-white shadow-inner ring-1 ring-amber-200/30",
  done: "bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 text-white shadow-inner ring-1 ring-emerald-200/25",
};

/** リキッドグラス列ボディ（背景ビルが透ける） */
const columnBody: Record<TaskStatus, string> = {
  not_started: "bg-white/12 backdrop-blur-xl",
  in_progress: "bg-amber-400/12 backdrop-blur-xl",
  done: "bg-emerald-400/10 backdrop-blur-xl",
};

const headerClip = {
  clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%)",
} as const;

type TaskColumnProps = {
  status: TaskStatus;
  tasks: Task[];
  onOpenTask: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
  addTask: (d?: {
    status?: TaskStatus;
    title?: string;
    parentId?: string;
  }) => void | Promise<void>;
  updateTask: (id: string, patch: Partial<Task>) => void | Promise<void>;
  deleteTask: (id: string) => void | Promise<void>;
};

export function TaskColumn({
  status,
  tasks,
  onOpenTask,
  onAddTask,
  addTask,
  updateTask,
  deleteTask,
}: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const columnTasks = tasksInStatus(tasks, status);
  const ids = columnTasks.map((t) => t.id);

  return (
    <section
      className={[
        "flex w-[min(100%,420px)] shrink-0 flex-col overflow-hidden rounded-2xl border border-white/35 shadow-2xl shadow-black/25 ring-1 ring-white/20",
        columnBody[status],
        isOver ? "ring-2 ring-sky-300/70 ring-offset-2 ring-offset-transparent" : "",
      ].join(" ")}
    >
      <header
        style={headerClip}
        className={[
          "flex items-center gap-2 px-3 py-2.5 pr-5",
          columnHeader[status],
        ].join(" ")}
      >
        <h2 className="min-w-0 flex-1 text-sm font-bold tracking-wide">
          {STATUS_LABEL[status]}
        </h2>
        <span className="rounded-full bg-black/15 px-2 py-0.5 text-xs font-bold tabular-nums">
          {columnTasks.length}
        </span>
        <button
          type="button"
          onClick={() => onAddTask(status)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/20 text-lg font-light leading-none text-white transition hover:bg-white/30"
          aria-label={`${STATUS_LABEL[status]}にタスクを追加`}
        >
          +
        </button>
      </header>

      <div
        ref={setNodeRef}
        className="flex min-h-[140px] flex-1 flex-col gap-2.5 p-2.5"
      >
        {columnTasks.length === 0 ? (
          <p className="py-8 text-center text-xs text-white/45">
            タスクがありません
          </p>
        ) : null}
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {columnTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              tasks={tasks}
              onOpen={onOpenTask}
              addTask={addTask}
              updateTask={updateTask}
              deleteTask={deleteTask}
            />
          ))}
        </SortableContext>

        <button
          type="button"
          onClick={() => onAddTask(status)}
          className="mt-auto rounded-xl border border-dashed border-white/35 bg-white/15 py-2.5 text-center text-xs font-medium text-white/85 backdrop-blur-sm transition hover:border-white/50 hover:bg-white/25 hover:text-white"
        >
          + 新規タスク
        </button>
      </div>
    </section>
  );
}
