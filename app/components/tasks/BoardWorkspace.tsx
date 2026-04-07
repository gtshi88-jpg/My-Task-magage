"use client";

import type { ReactNode } from "react";

/**
 * プランナー本体（タブ〜カンバン／一覧）。背景は AppShell 側の全面レイヤーに統一。
 */
export function BoardWorkspace({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
