import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Leaf } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: Auth,
});

function Auth() {
  const [mode, setMode] = useState<"login" | "signup" | "recover">("login");
  const navigate = useNavigate();
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
          onSubmit={(e) => { e.preventDefault(); navigate({ to: "/pantry" }); }}
          className="mt-8 space-y-3"
        >
          {mode === "signup" && <Field label="Name" type="text" placeholder="Alex" />}
          <Field label={mode === "recover" ? "Email or username" : "Email or username"} type="text" placeholder="you@example.com" />
          {mode !== "recover" && <Field label="Password" type="password" placeholder="••••••••" />}

          <button className="mt-2 flex w-full items-center justify-center rounded-2xl bg-primary px-5 py-4 text-[17px] font-semibold text-primary-foreground shadow-ios active:scale-[0.98] transition">
            {mode === "login" ? "Sign in" : mode === "signup" ? "Create account" : "Send recovery link"}
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
