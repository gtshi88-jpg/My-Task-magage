"use client";

import { useMemo, useState } from "react";
import type { Task } from "@/lib/types/task";
import {
  getMonthGrid,
  rootTasksByDueDate,
  toIsoDateString,
} from "@/lib/calendar-utils";
import { isTaskOverdue } from "@/lib/due-status";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"] as const;

const priorityDot: Record<Task["priority"], string> = {
  高: "bg-red-500",
  中: "bg-amber-500",
  低: "bg-zinc-400",
};

type DueDateCalendarProps = {
  tasks: Task[];
  onOpenTask: (task: Task) => void;
};

export function DueDateCalendar({ tasks, onOpenTask }: DueDateCalendarProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [monthIndex, setMonthIndex] = useState(now.getMonth());

  const byDue = useMemo(() => rootTasksByDueDate(tasks), [tasks]);
  const grid = useMemo(
    () => getMonthGrid(year, monthIndex),
    [year, monthIndex],
  );

  const todayIso = toIsoDateString(new Date());

  const title = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
  }).format(new Date(year, monthIndex, 1));

  function prevMonth() {
    if (monthIndex === 0) {
      setMonthIndex(11);
      setYear((y) => y - 1);
    } else {
      setMonthIndex((m) => m - 1);
    }
  }

  function nextMonth() {
    if (monthIndex === 11) {
      setMonthIndex(0);
      setYear((y) => y + 1);
    } else {
      setMonthIndex((m) => m + 1);
    }
  }

  function goToday() {
    const t = new Date();
    setYear(t.getFullYear());
    setMonthIndex(t.getMonth());
  }

  return (
    <section className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col overflow-y-auto bg-transparent px-3 py-3 sm:px-4 sm:py-4 md:px-5">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <p className="text-xs text-white/60">
            親タスクの納期がある日に表示されます
          </p>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={prevMonth}
              className="rounded-lg border border-white/25 bg-white/12 px-2 py-1 text-sm text-white backdrop-blur-sm hover:bg-white/20"
              aria-label="前月"
            >
              ‹
            </button>
            <span className="min-w-[8rem] text-center text-sm font-medium tabular-nums text-white">
              {title}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="rounded-lg border border-white/25 bg-white/12 px-2 py-1 text-sm text-white backdrop-blur-sm hover:bg-white/20"
              aria-label="翌月"
            >
              ›
            </button>
            <button
              type="button"
              onClick={goToday}
              className="rounded-lg bg-white/15 px-2 py-1 text-xs font-medium text-white ring-1 ring-white/20 backdrop-blur-sm hover:bg-white/25"
            >
              今月
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/25 bg-white/88 shadow-xl shadow-black/25 ring-1 ring-white/15 backdrop-blur-md">
          <div className="grid min-w-[640px] grid-cols-7 gap-px bg-zinc-200/80 p-px">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="bg-zinc-100/90 py-1.5 text-center text-[11px] font-medium text-zinc-600"
              >
                {d}
              </div>
            ))}
            {grid.map((cell) => {
              const dayTasks = byDue.get(cell.iso) ?? [];
              const isToday = cell.iso === todayIso;
              return (
                <div
                  key={`${cell.iso}-${cell.inMonth}`}
                  className={[
                    "flex min-h-[5.5rem] flex-col border-t border-zinc-100 bg-white p-1",
                    cell.inMonth ? "" : "bg-zinc-50/90 text-zinc-400",
                    isToday ? "ring-1 ring-inset ring-sky-400/60" : "",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "mb-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-medium tabular-nums",
                      isToday
                        ? "bg-sky-600 text-white"
                        : cell.inMonth
                          ? "text-zinc-800"
                          : "text-zinc-400",
                    ].join(" ")}
                  >
                    {cell.date.getDate()}
                  </span>
                  <ul className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto">
                    {dayTasks.map((t) => {
                      const overdue = isTaskOverdue(t);
                      return (
                      <li key={t.id}>
                        <button
                          type="button"
                          onClick={() => onOpenTask(t)}
                          className={[
                            "flex w-full min-w-0 items-start gap-1 rounded border px-1 py-0.5 text-left text-[10px] leading-tight shadow-sm",
                            overdue
                              ? "border-red-200 bg-red-50/90 text-red-950 hover:border-red-300 hover:bg-red-100/80"
                              : "border-zinc-100 bg-white text-zinc-800 hover:border-sky-200 hover:bg-sky-50/80",
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full",
                              priorityDot[t.priority],
                            ].join(" ")}
                            aria-hidden
                          />
                          <span className="line-clamp-2 break-all">{t.title}</span>
                        </button>
                      </li>
                    );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
