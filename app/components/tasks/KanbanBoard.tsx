"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useTasks } from "@/lib/hooks/useTasks";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { KanbanView } from "./KanbanView";
import { ShareBoardButton } from "./ShareBoardButton";

export function KanbanBoard() {
  const router = useRouter();
  const api = useTasks();

  const handleLogout = useCallback(async () => {
    const s = getBrowserSupabase();
    await s?.auth.signOut();
    router.push("/login");
    router.refresh();
  }, [router]);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <KanbanView
        api={api}
        mode="admin"
        onLogout={handleLogout}
        shareActions={<ShareBoardButton />}
      />
    </div>
  );
}
