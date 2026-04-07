"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function ShareBoardButton() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0, width: 352 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  function updatePanelPosition() {
    const el = buttonRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const maxW = Math.min(window.innerWidth - 32, 352);
    const left = Math.max(16, rect.right - maxW);
    setPanelPos({
      top: rect.bottom + 8,
      left,
      width: maxW,
    });
  }

  useLayoutEffect(() => {
    if (!open) return;
    updatePanelPosition();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onResizeOrScroll() {
      updatePanelPosition();
    }
    window.addEventListener("resize", onResizeOrScroll);
    window.addEventListener("scroll", onResizeOrScroll, true);
    return () => {
      window.removeEventListener("resize", onResizeOrScroll);
      window.removeEventListener("scroll", onResizeOrScroll, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleMouseDown(e: MouseEvent) {
      const t = e.target as Node;
      if (buttonRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [open]);

  useEffect(() => {
    if (!open || url !== null) return;
    if (fetchError) return;
    let cancelled = false;
    setLoading(true);
    void (async () => {
      const res = await fetch("/api/admin/share-link");
      if (!res.ok || cancelled) {
        if (!cancelled) {
          setLoading(false);
          setFetchError(true);
        }
        return;
      }
      const data = (await res.json()) as { token?: string };
      if (cancelled) return;
      if (data.token) {
        setUrl(`${window.location.origin}/share/${data.token}`);
      } else {
        setFetchError(true);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, url, fetchError]);

  async function copy() {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function toggle() {
    setOpen((o) => {
      const next = !o;
      if (next) setFetchError(false);
      return next;
    });
  }

  const panel =
    open && typeof document !== "undefined" ? (
      <div
        ref={panelRef}
        className="fixed z-[10000] rounded-xl border border-white/20 bg-slate-950/95 p-4 text-white shadow-2xl ring-1 ring-white/15 backdrop-blur-xl"
        style={{
          top: panelPos.top,
          left: panelPos.left,
          width: panelPos.width,
        }}
        role="dialog"
        aria-label="共有リンク"
      >
        <p className="mb-3 text-xs leading-relaxed text-white/75">
          ゲストはログイン不要でこのボードを編集できます。URLをコピーして相手に送ってください。
        </p>
        {loading ? (
          <p className="py-2 text-sm text-white/55">リンクを取得中…</p>
        ) : fetchError || !url ? (
          <p className="text-sm text-red-300">
            共有リンクを取得できませんでした。しばらくしてから再度お試しください。
          </p>
        ) : (
          <>
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-white/45">
              共有URL
            </label>
            <input
              readOnly
              value={url}
              className="mb-3 w-full rounded-lg border border-white/15 bg-white/10 px-2 py-2 text-xs text-white"
              onFocus={(e) => e.target.select()}
            />
            <button
              type="button"
              onClick={() => void copy()}
              className="w-full rounded-lg bg-gradient-to-b from-sky-500 to-indigo-600 py-2.5 text-sm font-medium text-white ring-1 ring-white/25 hover:from-sky-400 hover:to-indigo-500"
            >
              {copied ? "コピーしました" : "URLをコピー"}
            </button>
          </>
        )}
      </div>
    ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-sm font-medium text-white shadow-sm backdrop-blur-sm hover:bg-white/20"
      >
        共有
      </button>
      {panel ? createPortal(panel, document.body) : null}
    </>
  );
}
