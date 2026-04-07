import { KanbanBoard } from "@/app/components/tasks/KanbanBoard";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <KanbanBoard />
    </div>
  );
}
