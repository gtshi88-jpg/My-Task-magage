import { arrayMove } from "@dnd-kit/sortable";
import { columnIdToStatus } from "@/lib/constants/status";
import type { Task, TaskStatus } from "@/lib/types/task";

function sortByOrder(a: Task, b: Task): number {
  return a.order - b.order;
}

export function tasksInStatus(tasks: Task[], status: TaskStatus): Task[] {
  return tasks
    .filter((t) => t.parentId == null && t.status === status)
    .sort(sortByOrder);
}

/** 親タスク直下の子タスク（チェックリスト用） */
export function tasksByParentId(tasks: Task[], parentId: string): Task[] {
  return tasks
    .filter((t) => t.parentId === parentId)
    .sort(sortByOrder);
}

/**
 * ドラッグ終了時にタスク一覧を更新する。
 * @param overId アクティブカードの上にあった要素（列 ID または別タスク ID）
 */
export function applyDragEnd(
  tasks: Task[],
  activeId: string,
  overId: string,
): Task[] {
  if (activeId === overId) return tasks;

  const active = tasks.find((t) => t.id === activeId);
  if (!active || active.parentId != null) return tasks;

  const overColumn = columnIdToStatus(overId);
  if (overColumn) {
    return insertTaskInColumn(tasks, activeId, overColumn, null);
  }

  const overTask = tasks.find((t) => t.id === overId);
  if (!overTask) return tasks;

  if (active.status === overTask.status) {
    return reorderWithinColumn(tasks, activeId, overId, active.status);
  }

  return insertTaskInColumn(tasks, activeId, overTask.status, overId);
}

function reorderWithinColumn(
  tasks: Task[],
  activeId: string,
  overId: string,
  status: TaskStatus,
): Task[] {
  const column = tasksInStatus(tasks, status);
  const ids = column.map((t) => t.id);
  const oldIndex = ids.indexOf(activeId);
  const newIndex = ids.indexOf(overId);
  if (oldIndex < 0 || newIndex < 0) return tasks;
  if (oldIndex === newIndex) return tasks;

  const newIds = arrayMove(ids, oldIndex, newIndex);
  return applyColumnOrder(tasks, status, newIds);
}

function applyColumnOrder(
  tasks: Task[],
  status: TaskStatus,
  orderedIds: string[],
): Task[] {
  const others = tasks.filter(
    (t) => !(t.parentId == null && t.status === status),
  );
  const columnTasks = tasksInStatus(tasks, status);
  const map = new Map(columnTasks.map((t) => [t.id, t]));
  const reordered: Task[] = [];
  for (let i = 0; i < orderedIds.length; i++) {
    const id = orderedIds[i];
    const t = map.get(id);
    if (t) reordered.push({ ...t, order: i });
  }
  return [...others, ...reordered];
}

/** 列の先頭〜指定タスクの手前に挿入。insertBeforeId が null なら末尾。 */
function insertTaskInColumn(
  tasks: Task[],
  activeId: string,
  targetStatus: TaskStatus,
  insertBeforeId: string | null,
): Task[] {
  const active = tasks.find((t) => t.id === activeId);
  if (!active) return tasks;

  const withoutActive = tasks.filter((t) => t.id !== activeId);
  const column = tasksInStatus(withoutActive, targetStatus);
  const ids = column.map((t) => t.id);

  let insertIndex = ids.length;
  if (insertBeforeId) {
    const i = ids.indexOf(insertBeforeId);
    if (i >= 0) insertIndex = i;
  }

  const newIds = [...ids.slice(0, insertIndex), activeId, ...ids.slice(insertIndex)];
  const map = new Map(tasks.map((t) => [t.id, t]));
  const reordered: Task[] = [];
  for (let i = 0; i < newIds.length; i++) {
    const id = newIds[i];
    const t = map.get(id);
    if (!t) continue;
    reordered.push({
      ...t,
      status: targetStatus,
      order: i,
    });
  }

  const others = withoutActive.filter(
    (t) => !(t.parentId == null && t.status === targetStatus),
  );
  return [...others, ...reordered];
}
