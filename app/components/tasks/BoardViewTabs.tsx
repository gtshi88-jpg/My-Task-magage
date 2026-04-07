"use client";

export type PlannerWorkspaceMode = "kanban" | "calendar" | "gantt";

type BoardViewTabsProps = {
  mode: PlannerWorkspaceMode;
  onModeChange: (mode: PlannerWorkspaceMode) => void;
};

const TABS: { id: PlannerWorkspaceMode; label: string }[] = [
  { id: "kanban", label: "プランナー" },
  { id: "calendar", label: "カレンダー" },
  { id: "gantt", label: "ガントチャート" },
];

export function BoardViewTabs({ mode, onModeChange }: BoardViewTabsProps) {
  return (
    <div
      className="shrink-0 border-b border-white/12 bg-white/6 px-3 py-2.5 backdrop-blur-xl backdrop-saturate-150 sm:px-4"
      role="tablist"
      aria-label="プランナー内の表示切替"
    >
      <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center justify-center gap-1.5 sm:justify-start">
      {TABS.map((t) => {
        const active = mode === t.id;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onModeChange(t.id)}
            className={[
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              active
                ? "bg-gradient-to-b from-sky-400/95 to-indigo-600/95 text-white shadow-lg shadow-indigo-950/45 ring-1 ring-white/30"
                : "bg-white/10 text-white/75 ring-1 ring-white/12 hover:bg-white/16 hover:text-white",
            ].join(" ")}
          >
            {t.label}
          </button>
        );
      })}
      </div>
    </div>
  );
}
