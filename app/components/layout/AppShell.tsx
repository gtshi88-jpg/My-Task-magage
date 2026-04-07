"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { LiveClock } from "@/app/components/layout/LiveClock";
import { APP_BG_IMAGE_STYLE } from "@/lib/ui/liquid-glass";

export type AppMainView = "planner" | "list";

type AppShellProps = {
  children: ReactNode;
  mode: "admin" | "guest";
  mainView: AppMainView;
  onMainViewChange: (v: AppMainView) => void;
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  onNewTask: () => void;
  onLogout?: () => void;
  /** 管理者ヘッダー: 「+ 新規タスク」の直後に表示（例: 共有ボタン） */
  shareActions?: ReactNode;
  topSlot?: ReactNode;
  errorBanner?: ReactNode;
  guestBanner?: boolean;
};

function NavIcon({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={[
        "flex h-11 w-11 items-center justify-center rounded-xl transition backdrop-blur-md",
        active
          ? "bg-white/20 text-white shadow-inner ring-1 ring-white/30"
          : "text-slate-300 hover:bg-white/12 hover:text-white",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function AppShell({
  children,
  mode,
  mainView,
  onMainViewChange,
  searchQuery,
  onSearchQueryChange,
  onNewTask,
  onLogout,
  shareActions,
  topSlot,
  errorBanner,
  guestBanner,
}: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleNavSelect = (view: AppMainView) => {
    onMainViewChange(view);
    setMobileNavOpen(false);
  };

  return (
    <div className="relative flex min-h-dvh w-full flex-1 overflow-hidden bg-[linear-gradient(160deg,#0f172a_0%,#1e293b_45%,#172554_100%)]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-30%,rgba(56,189,248,0.12),transparent)]"
        aria-hidden
      />
      {mobileNavOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-sm md:hidden"
            aria-label="メニューを閉じる"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/10 bg-slate-950/90 p-4 backdrop-blur-xl md:hidden">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-950/50 ring-1 ring-white/25">
                T
              </div>
              <p className="text-sm font-semibold text-white/90">メニュー</p>
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleNavSelect("planner")}
                className={[
                  "w-full rounded-xl px-3 py-2 text-left text-sm transition",
                  mainView === "planner"
                    ? "bg-white/20 text-white ring-1 ring-white/25"
                    : "text-slate-200 hover:bg-white/10 hover:text-white",
                ].join(" ")}
              >
                プランナー
              </button>
              <button
                type="button"
                onClick={() => handleNavSelect("list")}
                className={[
                  "w-full rounded-xl px-3 py-2 text-left text-sm transition",
                  mainView === "list"
                    ? "bg-white/20 text-white ring-1 ring-white/25"
                    : "text-slate-200 hover:bg-white/10 hover:text-white",
                ].join(" ")}
              >
                一覧
              </button>
            </div>
          </aside>
        </>
      ) : null}

      <aside className="relative z-10 hidden w-[4.25rem] shrink-0 flex-col items-center border-r border-white/10 bg-slate-950/55 py-4 backdrop-blur-xl md:flex">
        <div className="mb-6 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-950/50 ring-1 ring-white/25">
          T
        </div>
        <nav className="flex flex-col gap-2">
          <NavIcon
            label="プランナー"
            active={mainView === "planner"}
            onClick={() => onMainViewChange("planner")}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </NavIcon>
          <NavIcon
            label="一覧"
            active={mainView === "list"}
            onClick={() => onMainViewChange("list")}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            >
              <path d="M4 6h16M4 12h16M4 18h11" />
            </svg>
          </NavIcon>
        </nav>
        <div className="mt-auto flex flex-col gap-2">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-500"
            title="設定（予定）"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </div>
        </div>
      </aside>

      <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col p-3 sm:p-4 md:pl-0">
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/20 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.65)] ring-1 ring-white/15">
          {/* リキッドグラス: パネル全面にビル背景＋ダークティント（ヘッダー〜列まで連続） */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl bg-cover bg-center bg-no-repeat"
            style={APP_BG_IMAGE_STYLE}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-950/82 via-indigo-950/72 to-slate-900/88"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_120%_90%_at_50%_-25%,rgba(99,102,241,0.28),transparent_52%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_70%_50%_at_100%_100%,rgba(56,189,248,0.12),transparent_55%)]"
            aria-hidden
          />

          <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
          {topSlot}
          {errorBanner}
          {guestBanner ? (
            <div className="shrink-0 border-b border-emerald-400/25 bg-emerald-500/15 px-4 py-2 text-center text-xs text-emerald-50 backdrop-blur-md">
              共有リンクで編集中（ログイン不要）
            </div>
          ) : null}

          <header className="shrink-0 border-b border-white/15 bg-white/10 px-3 py-3 backdrop-blur-xl backdrop-saturate-150 sm:px-4 sm:py-3.5">
            <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white/85 backdrop-blur-sm hover:bg-white/20 md:hidden"
              aria-label="メニューを開く"
              onClick={() => setMobileNavOpen(true)}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold tracking-tight text-white drop-shadow-[0_1px_12px_rgba(0,0,0,0.35)]">
                タスク
              </h1>
              <p className="text-[11px] text-white/70">
                {mode === "admin" ? "プランナーと納期を一元管理" : "共有ボード"}
              </p>
            </div>

            <div className="relative min-w-0 flex-1 basis-[min(100%,14rem)] sm:max-w-md">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-white/45">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.2-4.2" />
                </svg>
              </span>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                placeholder="タスクを検索…"
                className="w-full rounded-full border border-white/25 bg-white/12 py-2 pl-9 pr-3 text-sm text-white outline-none ring-sky-400/20 backdrop-blur-md placeholder:text-white/45 focus:border-sky-300/55 focus:bg-white/18 focus:ring-2 focus:ring-sky-400/25"
              />
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4">
              <LiveClock className="text-white/95 drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]" />
              <button
                type="button"
                className="hidden rounded-xl border border-white/20 bg-white/10 p-2 text-white/70 transition hover:bg-white/18 hover:text-white md:inline-flex"
                title="通知（準備中）"
                aria-label="通知"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
                </svg>
              </button>
              <div
                className="hidden items-center -space-x-2 lg:flex"
                title="メンバー（表示のみ）"
              >
                {["A", "B", "C"].map((letter, i) => (
                  <span
                    key={letter}
                    className={[
                      "flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/40 text-[10px] font-bold text-white shadow-lg shadow-black/20",
                      i === 0
                        ? "bg-violet-500"
                        : i === 1
                          ? "bg-teal-500"
                          : "bg-orange-500",
                    ].join(" ")}
                  >
                    {letter}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => onNewTask()}
                className="rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-300/35 transition hover:from-emerald-400 hover:to-emerald-600"
              >
                + 新規タスク
              </button>
              {shareActions}
              {mode === "admin" && onLogout ? (
                <button
                  type="button"
                  onClick={() => void onLogout()}
                  className="rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-sm text-white backdrop-blur-sm hover:bg-white/20"
                >
                  ログアウト
                </button>
              ) : null}
            </div>
            </div>
          </header>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {children}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
