/** yyyy-mm-dd を日本語日付表示に */
export function formatDueDate(iso: string | null): string {
  if (!iso) return "未設定";
  try {
    const d = new Date(`${iso}T12:00:00`);
    if (Number.isNaN(d.getTime())) return "未設定";
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  } catch {
    return "未設定";
  }
}
