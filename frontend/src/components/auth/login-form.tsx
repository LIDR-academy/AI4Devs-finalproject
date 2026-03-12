"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/use-auth";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .max(255, "Email must be 255 characters or fewer")
    .email("Enter a valid email address"),
  apiKey: z.string().trim().min(1, "API key is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function getApiErrorMessage(error: unknown) {
  if (typeof error === "object" && error && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) {
      return response.data.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Login failed. Try again.";
}

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      apiKey: "",
    },
  });

  const onSubmit = handleSubmit(async ({ email, apiKey }) => {
    try {
      await login(apiKey, email);
      toast.success("Login successful");
      router.push("/dashboard");
    } catch (error) {
      const message = getApiErrorMessage(error);
      setError("apiKey", { message: "Invalid API key" });
      toast.error(message);
    }
  });

  return (
    <Card className="rounded-3xl border-slate-200/80 p-6 md:p-8">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Access account</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Log in with your API key</h1>
        <p className="max-w-2xl text-sm text-slate-600 md:text-base">
          Enter the email used during registration and your saved API key to access your dashboard.
        </p>
      </div>

      <form className="mt-8 space-y-6" noValidate onSubmit={onSubmit}>
        {errors.root?.message ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errors.root.message}</div>
        ) : null}

        <div className="grid gap-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900" htmlFor="login-email">
              Email
            </label>
            <Input
              aria-describedby={errors.email ? "login-email-error" : undefined}
              aria-invalid={Boolean(errors.email)}
              autoComplete="email"
              id="login-email"
              maxLength={255}
              placeholder="user@example.com"
              type="email"
              {...register("email")}
            />
            <p className="min-h-5 text-sm text-rose-700" id="login-email-error">
              {errors.email?.message ?? ""}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900" htmlFor="apiKey">
              API Key
            </label>
            <Input
              aria-describedby={errors.apiKey ? "api-key-error" : undefined}
              aria-invalid={Boolean(errors.apiKey)}
              autoComplete="off"
              id="apiKey"
              placeholder="ipfs_gw_..."
              type="text"
              {...register("apiKey")}
            />
            <p className="min-h-5 text-sm text-rose-700" id="api-key-error">
              {errors.apiKey?.message ?? ""}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button className="min-w-40" disabled={isSubmitting} type="submit">
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <Spinner />
                Logging in
              </span>
            ) : (
              "Login"
            )}
          </Button>
          <p className="text-sm text-slate-600">
            Need an account?{" "}
            <Link className="font-semibold text-emerald-700 hover:text-emerald-800" href="/register">
              Register
            </Link>
          </p>
        </div>
      </form>
    </Card>
  );
}
