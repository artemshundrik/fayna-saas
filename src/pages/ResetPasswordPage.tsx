import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMsg(null);
    setBusy(true);

    try {
      if (!email.trim()) {
        setError("Вкажи email.");
        return;
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (resetError) throw resetError;
      setMsg("Лист для встановлення пароля надіслано. Перевір пошту.");
    } catch (err: any) {
      setError(err?.message ?? "Не вдалося надіслати лист.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md rounded-[28px] border border-border bg-card shadow-surface p-6 text-card-foreground">
        <div className="mb-5">
          <div className="text-xl font-extrabold text-foreground">Відновлення пароля</div>
          <div className="text-sm text-muted-foreground mt-1">Введи email, і ми надішлемо лист для встановлення нового пароля.</div>
        </div>

        {(error || msg) && (
          <div
            className={`mb-4 rounded-xl border p-3 text-sm font-medium ${
              error
                ? "bg-danger-soft border-danger-soft-border text-danger-foreground"
                : "bg-success-soft border-success-soft-border text-success-foreground"
            }`}
          >
            <div className="font-bold">{error ? "Помилка" : "Готово"}</div>
            <div className="mt-0.5 opacity-90">{error ?? msg}</div>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Email</label>
            <input
              className="mt-1.5 w-full rounded-[var(--radius-lg)] border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@gmail.com"
              autoComplete="email"
              type="email"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-[var(--btn-radius)] bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {busy ? "..." : "Надіслати лист"}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-muted-foreground">
          <Link className="underline hover:text-primary transition-colors" to="/login">
            Повернутись до входу
          </Link>
        </div>
      </div>
    </div>
  );
}
