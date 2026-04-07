import type { Task } from "@/lib/types/task";

/** ローカル日付を yyyy-mm-dd に */
export function toIsoDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export type CalendarCell = {
  iso: string;
  inMonth: boolean;
  date: Date;
};

/** 月のカレンダーグリッド（先頭日曜・6週分を埋める） */
export function getMonthGrid(year: number, monthIndex: number): CalendarCell[] {
  const first = new Date(year, monthIndex, 1);
  const last = new Date(year, monthIndex + 1, 0);
  const startPad = first.getDay();
  const daysInMonth = last.getDate();
  const cells: CalendarCell[] = [];

  const prevLast = new Date(year, monthIndex, 0).getDate();
  for (let i = 0; i < startPad; i++) {
    const day = prevLast - startPad + i + 1;
    const date = new Date(year, monthIndex - 1, day);
    cells.push({
      iso: toIsoDateString(date),
      inMonth: false,
      date,
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, monthIndex, d);
    cells.push({
      iso: toIsoDateString(date),
      inMonth: true,
      date,
    });
  }

  let next = 1;
  while (cells.length % 7 !== 0 || cells.length < 42) {
    const date = new Date(year, monthIndex + 1, next);
    cells.push({
      iso: toIsoDateString(date),
      inMonth: false,
      date,
    });
    next++;
  }

  return cells;
}

/** ボード上の親タスクのみ、納期キーごとに分類 */
export function rootTasksByDueDate(tasks: Task[]): Map<string, Task[]> {
  const map = new Map<string, Task[]>();
  for (const t of tasks) {
    if (t.parentId != null || !t.dueDate) continue;
    const list = map.get(t.dueDate) ?? [];
    list.push(t);
    map.set(t.dueDate, list);
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.order - b.order);
  }
  return map;
}
