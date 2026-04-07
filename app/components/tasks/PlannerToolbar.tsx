"use client";

import { STATUS_LABEL, STATUS_ORDER } from "@/lib/constants/status";
import type { TaskStatus } from "@/lib/types/task";

export type ToolbarMainView = "planner" | "list";

type PlannerToolbarProps = {
  mainView: ToolbarMainView;
  statusFilter: TaskStatus | null;
  onStatusFilterChange: (next: TaskStatus | null) => void;
  overdueOnly: boolean;
  onOverdueOnlyChange: (next: boolean) => void;
  onClearFilters: () => void;
};

export function PlannerToolbar({
  mainView,
  statusFilter,
  onStatusFilterChange,
  overdueOnly,
  onOverdueOnlyChange,
  onClearFilters,
}: PlannerToolbarProps) {
  const meta =
    mainView === "planner"
      ? {
          title: "プランナー",
          subtitle:
            "上部タブでカンバン・カレンダー・ガントを切替。列はドラッグで並べ替え",
        }
      : {
          title: "一覧",
          subtitle: "親タスクを表形式で表示。行をクリックで詳細を開きます",
        };

  return (
    <div className="shrink-0 border-b border-white/15 bg-white/8 px-3 py-3 backdrop-blur-xl backdrop-saturate-150 sm:px-4">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h2 className="text-base font-bold tracking-tight text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]">
            {meta.title}
          </h2>
          <p className="mt-0.5 text-[11px] leading-relaxed text-white/65">
            {meta.subtitle}
          </p>
        </div>

        <div
          className="flex flex-wrap items-center gap-1.5"
          role="group"
          aria-label="表示の絞り込み"
        >
          <span className="mr-1 hidden text-[10px] font-medium uppercase tracking-wide text-white/40 sm:inline">
            表示
          </span>
          <button
            type="button"
            onClick={onClearFilters}
            className={[
              "rounded-full px-3 py-1.5 text-xs font-semibold transition backdrop-blur-sm",
              statusFilter === null && !overdueOnly
                ? "bg-white/22 text-white shadow-md ring-1 ring-white/35"
                : "bg-white/10 text-white/85 ring-1 ring-white/15 hover:bg-white/18",
            ].join(" ")}
          >
            すべて
          </button>
          <button
            type="button"
            onClick={() => onOverdueOnlyChange(!overdueOnly)}
            className={[
              "rounded-full px-3 py-1.5 text-xs font-semibold transition backdrop-blur-sm",
              overdueOnly
                ? "bg-red-500/85 text-white shadow-md ring-1 ring-red-300/40"
                : "bg-white/10 text-white/85 ring-1 ring-white/15 hover:bg-red-500/25 hover:text-white",
            ].join(" ")}
          >
            期限切れ
          </button>
          {STATUS_ORDER.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() =>
                onStatusFilterChange(statusFilter === s ? null : s)
              }
              className={[
                "rounded-full px-3 py-1.5 text-xs font-semibold transition backdrop-blur-sm",
                statusFilter === s
                  ? s === "not_started"
                    ? "bg-slate-500/90 text-white shadow-md ring-1 ring-white/25"
                    : s === "in_progress"
                      ? "bg-amber-500/90 text-white shadow-md ring-1 ring-amber-200/40"
                      : "bg-emerald-500/90 text-white shadow-md ring-1 ring-emerald-200/35"
                  : "bg-white/10 text-white/85 ring-1 ring-white/15 hover:bg-white/18",
              ].join(" ")}
            >
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
