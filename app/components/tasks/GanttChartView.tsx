"use client";

import { useMemo } from "react";
import { STATUS_LABEL } from "@/lib/constants/status";
import {
  addDays,
  diffDaysUtc,
  parseIsoDate,
  startOfWeekMonday,
} from "@/lib/gantt-range";
import type { Task, TaskStatus } from "@/lib/types/task";

const TOTAL_DAYS = 56;

const statusBar: Record<TaskStatus, string> = {
  not_started: "bg-slate-500",
  in_progress: "bg-amber-500",
  done: "bg-emerald-500",
};

type GanttChartViewProps = {
  tasks: Task[];
  onOpenTask: (task: Task) => void;
};

export function GanttChartView({ tasks, onOpenTask }: GanttChartViewProps) {
  const { rangeStart, rootsWithDue, rootsWithoutDue } = useMemo(() => {
    const roots = tasks.filter((t) => t.parentId == null);
    const withDue = roots.filter((t) => t.dueDate);
    const withoutDue = roots.filter((t) => !t.dueDate);
    const today = new Date();
    let rangeStart = startOfWeekMonday(today);
    if (withDue.length > 0) {
      const minTs = Math.min(
        ...withDue.map((t) => parseIsoDate(t.dueDate!).getTime()),
      );
      const earliestMonday = startOfWeekMonday(new Date(minTs));
      if (earliestMonday.getTime() < rangeStart.getTime()) {
        rangeStart = earliestMonday;
      }
    }
    withDue.sort(
      (a, b) =>
        (a.dueDate ?? "").localeCompare(b.dueDate ?? "") ||
        a.title.localeCompare(b.title, "ja"),
    );
    withoutDue.sort((a, b) => a.title.localeCompare(b.title, "ja"));
    return {
      rangeStart,
      rootsWithDue: withDue,
      rootsWithoutDue: withoutDue,
    };
  }, [tasks]);

  const dayLabels = useMemo(() => {
    const labels: { date: Date; label: string; show: boolean }[] = [];
    for (let i = 0; i < TOTAL_DAYS; i++) {
      const date = addDays(rangeStart, i);
      const show = i === 0 || date.getDate() === 1 || i % 7 === 0;
      labels.push({
        date,
        label: `${date.getMonth() + 1}/${date.getDate()}`,
        show,
      });
    }
    return labels;
  }, [rangeStart]);

  function barStyle(dueIso: string): { left: string; width: string } {
    const due = parseIsoDate(dueIso);
    const idx = diffDaysUtc(rangeStart, due);
    const clamped = Math.max(0, Math.min(TOTAL_DAYS - 1, idx));
    const leftPct = (clamped / TOTAL_DAYS) * 100;
    const wPct = (1 / TOTAL_DAYS) * 100;
    return { left: `${leftPct}%`, width: `${Math.max(wPct, 0.7)}%` };
  }

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col overflow-hidden p-3 sm:p-4 md:p-5">
      <p className="mb-3 text-[11px] text-white/60">
        親タスクの納期をタイムライン上に表示します。行をクリックで詳細を開けます。
      </p>
      <div className="overflow-x-auto rounded-xl border border-white/25 bg-white/90 shadow-2xl shadow-black/30 ring-1 ring-white/15 backdrop-blur-md">
        <div className="min-w-[52rem]">
          {/* 日付ヘッダー */}
          <div className="flex border-b border-zinc-200 bg-zinc-50/90">
            <div className="sticky left-0 z-20 w-52 shrink-0 border-r border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-bold text-zinc-600">
              タスク
            </div>
            <div className="flex min-w-0 flex-1">
              {dayLabels.map((d, i) => (
                <div
                  key={i}
                  className={[
                    "flex-1 border-l border-zinc-100 py-1 text-center text-[9px] font-medium tabular-nums text-zinc-500",
                    d.show ? "bg-sky-50/60 text-sky-900" : "",
                  ].join(" ")}
                  style={{ flex: "1 1 0", minWidth: 0 }}
                  title={d.date.toLocaleDateString("ja-JP")}
                >
                  {d.show ? d.label : ""}
                </div>
              ))}
            </div>
          </div>

          {rootsWithDue.map((task) => {
            const pos = barStyle(task.dueDate!);
            return (
              <button
                key={task.id}
                type="button"
                onClick={() => onOpenTask(task)}
                className="flex w-full border-b border-zinc-100 text-left transition hover:bg-sky-50/40"
              >
                <div className="sticky left-0 z-10 w-52 shrink-0 border-r border-zinc-200 bg-white/95 px-3 py-2 text-xs backdrop-blur-sm">
                  <span className="line-clamp-2 font-medium text-zinc-900">
                    {task.title}
                  </span>
                  <span className="mt-0.5 block text-[10px] text-zinc-500">
                    {STATUS_LABEL[task.status]}
                  </span>
                </div>
                <div className="relative min-h-[44px] min-w-0 flex-1">
                  <div className="absolute inset-0 flex">
                    {Array.from({ length: TOTAL_DAYS }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 border-l border-zinc-50"
                        style={{ flex: "1 1 0", minWidth: 0 }}
                      />
                    ))}
                  </div>
                  <div
                    className="pointer-events-none absolute top-1/2 z-[1] h-3 -translate-y-1/2 rounded-sm shadow-sm"
                    style={{
                      left: pos.left,
                      width: pos.width,
                    }}
                  >
                    <div
                      className={[
                        "h-full rounded-sm",
                        statusBar[task.status],
                      ].join(" ")}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {rootsWithoutDue.length > 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 p-3">
          <p className="mb-2 text-xs font-semibold text-zinc-600">
            納期未設定（{rootsWithoutDue.length} 件）
          </p>
          <ul className="flex flex-wrap gap-2">
            {rootsWithoutDue.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => onOpenTask(t)}
                  className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-left text-xs text-zinc-800 hover:border-sky-300 hover:bg-sky-50"
                >
                  {t.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
