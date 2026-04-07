"use client";

import { useCallback, useEffect, useState } from "react";
import { STATUS_ORDER } from "@/lib/constants/status";
import type { Priority, Task, TaskStatus } from "@/lib/types/task";

function sortTasks(list: Task[]): Task[] {
  const roots = list.filter((t) => t.parentId == null);
  const children = list.filter((t) => t.parentId != null);
  const sortedRoots = [...roots].sort((a, b) => {
    const si = STATUS_ORDER.indexOf(a.status);
    const sj = STATUS_ORDER.indexOf(b.status);
    if (si !== sj) return si - sj;
    return a.order - b.order;
  });
  const sortedChildren = [...children].sort((a, b) => {
    const pa = String(a.parentId);
    const pb = String(b.parentId);
    if (pa !== pb) return pa.localeCompare(pb);
    return a.order - b.order;
  });
  return [...sortedRoots, ...sortedChildren];
}

function nextOrderForStatus(tasks: Task[], status: TaskStatus): number {
  const inCol = tasks.filter((t) => t.parentId == null && t.status === status);
  if (inCol.length === 0) return 0;
  return Math.max(...inCol.map((t) => t.order)) + 1;
}

function nextOrderForParent(tasks: Task[], parentId: string): number {
  const siblings = tasks.filter((t) => t.parentId === parentId);
  if (siblings.length === 0) return 0;
  return Math.max(...siblings.map((t) => t.order)) + 1;
}

function headers(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    "X-Share-Token": token,
  };
}

export function useGuestTasks(shareToken: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!shareToken?.trim()) {
      setError("共有トークンがありません。");
      setLoading(false);
      return;
    }
    setError(null);
    const res = await fetch("/api/guest/tasks", {
      headers: headers(shareToken),
    });
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setError(j.error ?? `HTTP ${res.status}`);
      setLoading(false);
      return;
    }
    const data = (await res.json()) as { tasks: Task[] };
    setTasks(sortTasks(data.tasks ?? []));
    setLoading(false);
  }, [shareToken]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      void fetchTasks();
    });
    return () => cancelAnimationFrame(id);
  }, [fetchTasks]);

  useEffect(() => {
    const t = setInterval(() => {
      void fetchTasks();
    }, 4000);
    return () => clearInterval(t);
  }, [fetchTasks]);

  const addTask = useCallback(
    async (defaults?: {
      status?: TaskStatus;
      title?: string;
      parentId?: string;
    }) => {
      if (!shareToken?.trim()) return;
      const parentId = defaults?.parentId?.trim() || null;
      let created: Task | undefined;
      setTasks((prev) => {
        if (parentId) {
          const parent = prev.find((t) => t.id === parentId);
          if (!parent || parent.parentId != null) {
            return prev;
          }
          const order = nextOrderForParent(prev, parentId);
          created = {
            id: crypto.randomUUID(),
            parentId,
            title: defaults?.title?.trim() || "改修項目",
            senderName: "",
            receiverName: "",
            priority: "中",
            dueDate: null,
            status: "not_started",
            order,
            description: "",
          };
        } else {
          const status = defaults?.status ?? "not_started";
          const order = nextOrderForStatus(prev, status);
          created = {
            id: crypto.randomUUID(),
            parentId: null,
            title: defaults?.title ?? "新しいタスク",
            senderName: "",
            receiverName: "",
            priority: "中",
            dueDate: null,
            status,
            order,
            description: "",
          };
        }
        if (!created) return prev;
        return sortTasks([...prev, created]);
      });
      if (!created) return;
      const res = await fetch("/api/guest/tasks", {
        method: "POST",
        headers: headers(shareToken),
        body: JSON.stringify(created),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? "追加に失敗しました");
        await fetchTasks();
      }
    },
    [fetchTasks, shareToken],
  );

  const updateTask = useCallback(
    async (id: string, patch: Partial<Task>) => {
      if (!shareToken?.trim()) return;
      let merged: Task | undefined;
      setTasks((prev) => {
        const cur = prev.find((x) => x.id === id);
        if (!cur) return prev;
        merged = { ...cur, ...patch };
        return sortTasks(prev.map((x) => (x.id === id ? merged! : x)));
      });
      if (!merged) return;
      const res = await fetch(`/api/guest/tasks/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: headers(shareToken),
        body: JSON.stringify(merged),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? "更新に失敗しました");
        await fetchTasks();
      }
    },
    [fetchTasks, shareToken],
  );

  const applyTasks = useCallback(
    async (next: Task[]) => {
      if (!shareToken?.trim()) return;
      const sorted = sortTasks(next);
      setTasks(sorted);
      const res = await fetch("/api/guest/tasks", {
        method: "PUT",
        headers: headers(shareToken),
        body: JSON.stringify({ tasks: sorted }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? "保存に失敗しました");
        await fetchTasks();
      }
    },
    [fetchTasks, shareToken],
  );

  const deleteTask = useCallback(
    async (id: string) => {
      if (!shareToken?.trim()) return;
      setTasks((prev) =>
        prev.filter((x) => x.id !== id && x.parentId !== id),
      );
      const res = await fetch(`/api/guest/tasks/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: headers(shareToken),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? "削除に失敗しました");
        await fetchTasks();
      }
    },
    [fetchTasks, shareToken],
  );

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    applyTasks,
    deleteTask,
    refetch: fetchTasks,
  };
}

export type { Priority, Task, TaskStatus };
