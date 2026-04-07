/** 表示用イニシャル（日本語は先頭〜2文字、空白・中点で分割） */
export function initialsFromName(name: string): string {
  const t = name.trim();
  if (!t) return "?";
  const parts = t.split(/[\s・]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`;
  }
  const s = parts[0] ?? t;
  return s.length <= 2 ? s : s.slice(0, 2);
}
