"use client";

import { useEffect, useState } from "react";

type LiveClockProps = {
  className?: string;
};

/**
 * 現在時刻のみ（HH:mm）。ヘッダー用に大きめ表示。
 */
export function LiveClock({ className }: LiveClockProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) {
    return (
      <span
        className={[
          "inline-block h-8 w-[4.5rem] animate-pulse rounded-lg sm:h-9 sm:w-[5.5rem]",
          className ? "bg-white/15" : "bg-zinc-200/80",
        ].join(" ")}
        aria-hidden
      />
    );
  }

  const timeOnly = new Intl.DateTimeFormat("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);

  return (
    <time
      dateTime={now.toISOString()}
      className={[
        "inline-flex shrink-0 tabular-nums tracking-tight",
        "text-xl font-semibold leading-none sm:text-2xl md:text-3xl",
        className ?? "text-zinc-500",
      ].join(" ")}
    >
      {timeOnly}
    </time>
  );
}
