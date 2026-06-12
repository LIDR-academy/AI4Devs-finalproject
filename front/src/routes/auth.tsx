import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Leaf } from "lucide-react";
import { login, register } from "@/features/auth/auth.api";
import { saveSession } from "@/features/auth/session";

export const Route = createFileRoute("/auth")({
  component: Auth,
});

function Auth() {
  const [mode, setMode] = useState<"login" | "signup" | "recover">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const submitLabel =
    mode === "login"
      ? "Sign in"
      : mode === "signup"
        ? "Create account"
        : "Send recovery link";

  const isAuthMode = mode === "login" || mode === "signup";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (mode === "recover") {
      setError("Password recovery is not available in MVP yet.");
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Email and password are required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response =
        mode === "login"
          ? await login({ email: trimmedEmail, password })
          : await register({ email: trimmedEmail, password });

      saveSession(response);
      navigate({ to: "/pantry" });
    } catch (apiError) {
      const fallbackMessage =
        mode === "signup"
          ? "Could not create account. Please try again."
          : "Invalid email or password.";
      setError(apiError instanceof Error ? apiError.message : fallbackMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md px-6 pt-14 pb-10">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground"><Leaf className="size-5"/></div>
          <span className="text-sm font-semibold">RealSaveFooding</span>
        </Link>

        <h1 className="mt-8 text-3xl font-bold tracking-tight">
          {mode === "login" ? "Welcome back" : mode === "signup" ? "Create account" : "Recover password"}
        </h1>
        <p className="mt-2 text-[15px] text-muted-foreground">
          {mode === "recover" ? "We'll email you a recovery link." : "Sign in to sync your pantry across devices."}
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-3"
        >
          <Field
            label={mode === "recover" ? "Email or username" : "Email"}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          {mode !== "recover" && (
            <Field
              label="Password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          )}

          {error && (
            <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-[13px] text-destructive">
              {error}
            </p>
          )}

          <button
            disabled={isSubmitting}
            className="mt-2 flex w-full items-center justify-center rounded-2xl bg-primary px-5 py-4 text-[17px] font-semibold text-primary-foreground shadow-ios active:scale-[0.98] transition disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting && isAuthMode ? "Please wait..." : submitLabel}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-[14px]">
          {mode !== "login" ? (
            <button className="text-primary font-medium" onClick={() => setMode("login")}>Sign in</button>
          ) : <span />}
          {mode !== "signup" && <button className="text-primary font-medium" onClick={() => setMode("signup")}>Create account</button>}
          {mode !== "recover" && <button className="text-muted-foreground" onClick={() => setMode("recover")}>Forgot password?</button>}
        </div>
      </div>
    </div>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-muted-foreground">{label}</span>
      <input
        {...props}
        className="w-full rounded-2xl border border-border bg-surface px-4 py-3.5 text-[16px] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}
