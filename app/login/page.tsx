"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const supabase = getBrowserSupabase();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!supabase) {
      setMessage(
        ".env.local に NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を設定してください。",
      );
      return;
    }
    setPending(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          },
        });
        if (error) {
          setMessage(error.message);
          return;
        }
        setMessage(
          "確認メールを送信しました。メール内のリンクを開くか、確認をオフにしている場合はそのままログインを試してください。",
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          setMessage(error.message);
          return;
        }
        router.push(next);
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-zinc-100 px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-center text-lg font-semibold text-zinc-900">
          タスク管理
        </h1>
        <p className="mt-1 text-center text-xs text-zinc-500">
          {mode === "signin" ? "ログイン" : "新規登録"}
        </p>

        {(urlError || message) && (
          <p
            className={`mt-4 rounded-lg px-3 py-2 text-sm ${
              message && !urlError
                ? "bg-sky-50 text-sky-900"
                : "bg-red-50 text-red-800"
            }`}
          >
            {urlError === "auth"
              ? "認証に失敗しました。もう一度お試しください。"
              : message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-zinc-600">
              メールアドレス
            </span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none ring-zinc-400 focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-zinc-600">
              パスワード
            </span>
            <input
              type="password"
              autoComplete={
                mode === "signup" ? "new-password" : "current-password"
              }
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none ring-zinc-400 focus:ring-2"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-sky-600 py-2.5 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
          >
            {pending
              ? "処理中…"
              : mode === "signin"
                ? "ログイン"
                : "登録する"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setMessage(null);
          }}
          className="mt-4 w-full text-center text-sm text-sky-700 hover:underline"
        >
          {mode === "signin"
            ? "アカウントを作成する"
            : "ログイン画面に戻る"}
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-zinc-100 p-8 text-zinc-500">
          読み込み中…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
