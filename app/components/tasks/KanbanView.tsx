"use client";

import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { AppShell } from "@/app/components/layout/AppShell";
import { STATUS_ORDER } from "@/lib/constants/status";
import { applyDragEnd, tasksByParentId } from "@/lib/task-board";
import { isTaskOverdue } from "@/lib/due-status";
import { filterTasksForUI } from "@/lib/task-filter";
import type { Task, TaskStatus } from "@/lib/types/task";
import { formatDueDate } from "@/lib/format";
import { initialsFromName } from "@/lib/initials";
import {
  BoardViewTabs,
  type PlannerWorkspaceMode,
} from "./BoardViewTabs";
import { BoardWorkspace } from "./BoardWorkspace";
import { DueDateCalendar } from "./DueDateCalendar";
import { GanttChartView } from "./GanttChartView";
import { PlannerToolbar } from "./PlannerToolbar";
import { TaskListView } from "./TaskListView";
import { TaskColumn } from "./TaskColumn";
import { TaskDetailPanel } from "./TaskDetailPanel";

const priorityClass: Record<Task["priority"], string> = {
  高: "bg-red-50 text-red-800 ring-red-100",
  中: "bg-amber-50 text-amber-900 ring-amber-100",
  低: "bg-zinc-100 text-zinc-700 ring-zinc-200",
};

function OverlayCard({ task, tasks }: { task: Task; tasks: Task[] }) {
  const requestLine =
    task.senderName || task.receiverName
      ? `${task.senderName || "—"} → ${task.receiverName || "—"}`
      : "依頼元・依頼先 未設定";
  const subs = tasksByParentId(tasks, task.id);
  const doneCount = subs.filter((c) => c.status === "done").length;
  const titleShort = Array.from(task.title).length <= 20;
  return (
    <div className="w-[min(100vw-2rem,420px)] min-w-[300px] rounded-2xl border border-white/60 bg-white/95 p-3.5 shadow-2xl ring-2 ring-sky-400/30 backdrop-blur-sm">
      <p
        className={[
          "font-semibold leading-snug text-zinc-900",
          titleShort ? "break-words" : "line-clamp-2 min-w-0 break-words",
        ].join(" ")}
      >
        {task.title}
      </p>
      {isTaskOverdue(task) ? (
        <p className="mt-1 text-[10px] font-bold text-red-700">期限切れ</p>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-2">
        <span
          className={[
            "inline-flex rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
            priorityClass[task.priority],
          ].join(" ")}
        >
          {task.priority}
        </span>
        <span
          className={[
            "text-xs",
            isTaskOverdue(task) ? "font-semibold text-red-700" : "text-zinc-500",
          ].join(" ")}
        >
          納期 {formatDueDate(task.dueDate)}
        </span>
        {subs.length > 0 ? (
          <span className="text-xs tabular-nums text-zinc-600">
            改修 {doneCount}/{subs.length}
          </span>
        ) : null}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 border-t border-zinc-200/80 pt-2">
        <p className="min-w-0 flex-1 text-xs text-zinc-600">{requestLine}</p>
        <div className="flex shrink-0 gap-0.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-600 text-[10px] font-bold text-white">
            {task.senderName.trim()
              ? initialsFromName(task.senderName)
              : "—"}
          </span>
          <span className="text-[10px] text-zinc-400" aria-hidden>
            →
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-600 text-[10px] font-bold text-white">
            {task.receiverName.trim()
              ? initialsFromName(task.receiverName)
              : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}

export type KanbanTasksApi = {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  refetch: () => void | Promise<void>;
  addTask: (d?: {
    status?: TaskStatus;
    title?: string;
    parentId?: string;
  }) => void | Promise<void>;
  updateTask: (id: string, patch: Partial<Task>) => void | Promise<void>;
  applyTasks: (next: Task[]) => void | Promise<void>;
  deleteTask: (id: string) => void | Promise<void>;
};

type KanbanViewProps = {
  api: KanbanTasksApi;
  mode: "admin" | "guest";
  onLogout?: () => void;
  /** 管理者ヘッダー: 新規タスクの隣の共有など */
  shareActions?: ReactNode;
  topSlot?: ReactNode;
};

export function KanbanView({
  api,
  mode,
  onLogout,
  shareActions,
  topSlot,
}: KanbanViewProps) {
  const {
    tasks,
    loading,
    error,
    refetch,
    addTask,
    updateTask,
    applyTasks,
    deleteTask,
  } = api;

  const [mainView, setMainView] = useState<"planner" | "list">("planner");
  const [workspaceMode, setWorkspaceMode] =
    useState<PlannerWorkspaceMode>("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | null>(null);
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const displayTasks = useMemo(
    () =>
      filterTasksForUI(tasks, searchQuery, statusFilter, overdueOnly),
    [tasks, searchQuery, statusFilter, overdueOnly],
  );

  const clearFilters = useCallback(() => {
    setStatusFilter(null);
    setOverdueOnly(false);
  }, []);

  const selectedTask = selectedId
    ? (tasks.find((t) => t.id === selectedId) ?? null)
    : null;
  const detailOpen = selectedId !== null && selectedTask !== null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const id = String(event.active.id);
      setActiveTask(tasks.find((t) => t.id === id) ?? null);
    },
    [tasks],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveTask(null);
      const { active, over } = event;
      if (!over) return;
      const nextPartial = applyDragEnd(
        displayTasks,
        String(active.id),
        String(over.id),
      );
      const partialMap = new Map(nextPartial.map((t) => [t.id, t]));
      const nextFull = tasks.map((t) => partialMap.get(t.id) ?? t);
      void applyTasks(nextFull);
    },
    [tasks, displayTasks, applyTasks],
  );

  const openDetail = useCallback((task: Task) => {
    setSelectedId(task.id);
  }, []);

  const closeDetail = useCallback(() => {
    setSelectedId(null);
  }, []);

  const errorBanner = error ? (
    <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-red-400/30 bg-red-500/15 px-4 py-2 text-sm text-red-50 backdrop-blur-md">
      <span className="min-w-0 flex-1">{error}</span>
      <button
        type="button"
        onClick={() => void refetch()}
        className="shrink-0 rounded-lg bg-white/15 px-3 py-1.5 font-medium text-white ring-1 ring-white/25 hover:bg-white/25"
      >
        再読み込み
      </button>
    </div>
  ) : null;

  if (loading && tasks.length === 0) {
    return (
      <div className="relative flex min-h-dvh flex-1 items-center justify-center overflow-hidden bg-[linear-gradient(160deg,#0f172a_0%,#1e293b_45%,#172554_100%)] p-8">
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat opacity-55"
          style={{ backgroundImage: "url('/bg-app.png')" }}
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0 bg-slate-950/65" aria-hidden />
        <div className="relative flex flex-col items-center gap-4 rounded-2xl border border-white/15 bg-white/10 px-10 py-8 text-white/90 shadow-2xl backdrop-blur-xl">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-sky-300 border-t-transparent" />
          <p className="text-sm font-medium tracking-wide">読み込み中…</p>
        </div>
      </div>
    );
  }

  return (
    <AppShell
      mode={mode}
      mainView={mainView}
      onMainViewChange={setMainView}
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
      onNewTask={() => void addTask({ status: "not_started" })}
      onLogout={onLogout}
      shareActions={shareActions}
      topSlot={topSlot}
      errorBanner={errorBanner}
      guestBanner={mode === "guest"}
    >
      <>
        <PlannerToolbar
          mainView={mainView}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          overdueOnly={overdueOnly}
          onOverdueOnlyChange={setOverdueOnly}
          onClearFilters={clearFilters}
        />
        <BoardWorkspace>
          {mainView === "planner" ? (
            <>
              <BoardViewTabs
                mode={workspaceMode}
                onModeChange={setWorkspaceMode}
              />
              {workspaceMode === "kanban" ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCorners}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <div className="flex min-h-[min(60vh,640px)] flex-1 justify-start overflow-x-auto overflow-y-hidden px-3 py-3 touch-pan-x sm:min-h-[min(65vh,680px)] sm:px-4 sm:py-4 md:px-5">
                    <div className="flex w-max min-w-full shrink-0 justify-start gap-3 sm:gap-4">
                    {STATUS_ORDER.map((status) => (
                      <TaskColumn
                        key={status}
                        status={status}
                        tasks={displayTasks}
                        onOpenTask={openDetail}
                        onAddTask={(s) => void addTask({ status: s })}
                        addTask={addTask}
                        updateTask={updateTask}
                        deleteTask={deleteTask}
                      />
                    ))}
                    </div>
                  </div>

                  <DragOverlay dropAnimation={null}>
                    {activeTask ? (
                      <OverlayCard task={activeTask} tasks={tasks} />
                    ) : null}
                  </DragOverlay>
                </DndContext>
              ) : workspaceMode === "calendar" ? (
                <DueDateCalendar
                  tasks={displayTasks}
                  onOpenTask={openDetail}
                />
              ) : (
                <GanttChartView
                  tasks={displayTasks}
                  onOpenTask={openDetail}
                />
              )}
            </>
          ) : (
            <TaskListView tasks={displayTasks} onOpenTask={openDetail} />
          )}
        </BoardWorkspace>

        <TaskDetailPanel
          allTasks={tasks}
          task={selectedTask}
          open={detailOpen}
          onClose={closeDetail}
          onSave={(id, patch) => updateTask(id, patch)}
          onDelete={(id) => void deleteTask(id)}
          addTask={addTask}
          updateTask={updateTask}
          deleteSubtask={(id) => void deleteTask(id)}
        />
      </>
    </AppShell>
  );
}
