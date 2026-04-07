"use client";

import { useCallback, useEffect, useState } from "react";
import { STATUS_ORDER } from "@/lib/constants/status";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { rowToTask, taskToRow } from "@/lib/tasks/db-map";
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

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = getBrowserSupabase();

  const fetchTasks = useCallback(async () => {
    if (!supabase) {
      setError(
        "Supabase の URL / anon キーを .env.local に設定してください（NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY）。",
      );
      setLoading(false);
      return;
    }
    setError(null);
    const { data, error: qError } = await supabase.from("tasks").select("*");
    if (qError) {
      setError(qError.message);
      setLoading(false);
      return;
    }
    const mapped = (data ?? []).map((row) =>
      rowToTask(row as Record<string, unknown>),
    );
    setTasks(sortTasks(mapped));
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      void fetchTasks();
    });
    return () => cancelAnimationFrame(id);
  }, [fetchTasks]);

  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel("tasks-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        (payload) => {
          if (payload.eventType === "INSERT" && payload.new) {
            const t = rowToTask(payload.new as Record<string, unknown>);
            setTasks((prev) => {
              if (prev.some((x) => x.id === t.id)) return prev;
              return sortTasks([...prev, t]);
            });
          } else if (payload.eventType === "UPDATE" && payload.new) {
            const t = rowToTask(payload.new as Record<string, unknown>);
            setTasks((prev) =>
              sortTasks(prev.map((x) => (x.id === t.id ? t : x))),
            );
          } else if (payload.eventType === "DELETE" && payload.old) {
            const id = String((payload.old as { id: string }).id);
            setTasks((prev) => prev.filter((x) => x.id !== id));
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase]);

  const addTask = useCallback(
    async (defaults?: {
      status?: TaskStatus;
      title?: string;
      parentId?: string;
    }) => {
      if (!supabase) {
        setError("Supabase が未設定です。");
        return;
      }
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
      const { error: insErr } = await supabase
        .from("tasks")
        .insert(taskToRow(created));
      if (insErr) {
        setError(insErr.message);
        await fetchTasks();
      }
    },
    [supabase, fetchTasks],
  );

  const updateTask = useCallback(
    async (id: string, patch: Partial<Task>) => {
      if (!supabase) {
        setError("Supabase が未設定です。");
        return;
      }
      let merged: Task | undefined;
      setTasks((prev) => {
        const cur = prev.find((t) => t.id === id);
        if (!cur) return prev;
        merged = { ...cur, ...patch };
        return sortTasks(prev.map((t) => (t.id === id ? merged! : t)));
      });
      if (!merged) return;
      const { error: upErr } = await supabase
        .from("tasks")
        .update(taskToRow(merged))
        .eq("id", id);
      if (upErr) {
        setError(upErr.message);
        await fetchTasks();
      }
    },
    [supabase, fetchTasks],
  );

  const applyTasks = useCallback(
    async (next: Task[]) => {
      if (!supabase) {
        setError("Supabase が未設定です。");
        return;
      }
      const sorted = sortTasks(next);
      setTasks(sorted);
      const rows = sorted.map(taskToRow);
      const { error: upErr } = await supabase
        .from("tasks")
        .upsert(rows, { onConflict: "id" });
      if (upErr) {
        setError(upErr.message);
        await fetchTasks();
      }
    },
    [supabase, fetchTasks],
  );

  const deleteTask = useCallback(
    async (id: string) => {
      if (!supabase) {
        setError("Supabase が未設定です。");
        return;
      }
      setTasks((prev) =>
        prev.filter((t) => t.id !== id && t.parentId !== id),
      );
      const { error: delErr } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id);
      if (delErr) {
        setError(delErr.message);
        await fetchTasks();
      }
    },
    [supabase, fetchTasks],
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
