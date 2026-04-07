"use client";

import { use } from "react";
import { useGuestTasks } from "@/lib/hooks/useGuestTasks";
import { KanbanView } from "@/app/components/tasks/KanbanView";

type PageProps = {
  params: Promise<{ token: string }>;
};

export default function SharePage({ params }: PageProps) {
  const { token } = use(params);
  const api = useGuestTasks(decodeURIComponent(token));

  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <KanbanView api={api} mode="guest" />
      </div>
    </div>
  );
}
