-- 共有ボード用の単一行テーブル（1 本のトークン）。サービスロール経由でのみ読み書き想定。
create table if not exists public.board_share (
  id smallint primary key default 1 check (id = 1),
  token text not null unique
);

alter table public.board_share enable row level security;

-- クライアントの anon キーでは参照させない（API のサービスロールのみ使用）
-- ポリシー未作成のため anon はアクセス不可

insert into public.board_share (id, token)
values (1, encode(gen_random_bytes(24), 'hex'))
on conflict (id) do nothing;
