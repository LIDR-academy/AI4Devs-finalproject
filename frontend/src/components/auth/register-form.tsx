"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { RegistrationSuccessDialog } from "@/components/auth/registration-success-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const registerSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .max(255, "Email must be 255 characters or fewer")
      .email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must include at least one uppercase letter")
      .regex(/[0-9]/, "Password must include at least one digit"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

type RegistrationResult = {
  email: string;
  apiKey: string;
};

const strengthLevels = [
  { threshold: 1, label: "Weak", color: "bg-rose-500" },
  { threshold: 2, label: "Fair", color: "bg-amber-500" },
  { threshold: 3, label: "Good", color: "bg-lime-500" },
  { threshold: 4, label: "Strong", color: "bg-emerald-600" },
] as const;

function calculatePasswordStrength(password: string) {
  const score = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;
  const level = strengthLevels.findLast((item) => score >= item.threshold) ?? strengthLevels[0];
  return { score, ...level };
}

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

  return "Registration failed. Try again.";
}

export function RegisterForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<RegistrationResult | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    setFocus,
    watch,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");
  const passwordStrength = useMemo(() => calculatePasswordStrength(password), [password]);
  const liveErrorMessage = Object.values(errors)[0]?.message;

  useEffect(() => {
    const firstErrorField = (Object.keys(errors)[0] ?? null) as keyof RegisterFormValues | null;
    if (firstErrorField) {
      setFocus(firstErrorField);
    }
  }, [errors, setFocus]);

  const onSubmit = handleSubmit(async ({ email, password: nextPassword }) => {
    try {
      const response = await api.register({ email, password: nextPassword });
      if (!response.data) {
        throw new Error("Registration response did not include user credentials");
      }

      setRegistrationResult({
        email: response.data.email,
        apiKey: response.data.api_key,
      });
      toast.success("Registration successful. Save your API key now.");
    } catch (error) {
      const message = getApiErrorMessage(error);

      if (message.toLowerCase().includes("email already registered")) {
        setError("email", { message: "This email is already registered. Try logging in instead." });
      } else {
        setError("root", { message });
      }

      toast.error(message);
    }
  });

  const handleCopyApiKey = async () => {
    if (!registrationResult) {
      return;
    }

    await navigator.clipboard.writeText(registrationResult.apiKey);
    toast.success("API key copied to clipboard");
  };

  const handleDownloadApiKey = () => {
    if (!registrationResult) {
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const content = [`IPFS Gateway API Key`, `Email: ${registrationResult.email}`, `Generated: ${new Date().toISOString()}`, `API Key: ${registrationResult.apiKey}`].join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `ipfs-gateway-api-key-${timestamp}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success("API key downloaded");
  };

  const handleContinue = () => {
    if (!registrationResult) {
      return;
    }

    login(registrationResult.apiKey, registrationResult.email);
    setRegistrationResult(null);
    router.push("/dashboard");
  };

  return (
    <>
      <Card className="rounded-3xl border-slate-200/80 p-6 md:p-8">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">User onboarding</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Create your account</h1>
          <p className="max-w-2xl text-sm text-slate-600 md:text-base">
            Register to receive a one-time API key for the IPFS Gateway. Save it securely before continuing to your dashboard.
          </p>
        </div>

        <form className="mt-8 space-y-6" noValidate onSubmit={onSubmit}>
          <div aria-live="polite" className="sr-only" role="status">
            {liveErrorMessage ?? "Form ready"}
          </div>

          {errors.root?.message ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errors.root.message}</div>
          ) : null}

          <div className="grid gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900" htmlFor="email">
                Email
              </label>
              <Input
                aria-describedby={errors.email ? "email-error" : undefined}
                aria-invalid={Boolean(errors.email)}
                autoComplete="email"
                id="email"
                maxLength={255}
                placeholder="user@example.com"
                type="email"
                {...register("email")}
              />
              <p className="min-h-5 text-sm text-rose-700" id="email-error">
                {errors.email?.message ?? ""}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Input
                  aria-describedby="password-help password-error"
                  aria-invalid={Boolean(errors.password)}
                  autoComplete="new-password"
                  className="pr-12"
                  id="password"
                  placeholder="Choose a strong password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                />
                <button
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  onClick={() => setShowPassword((value) => !value)}
                  type="button"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-sm text-slate-500" id="password-help">
                Use at least 8 characters, one uppercase letter, and one number.
              </p>
              <div aria-live="polite" className="space-y-2" id="password-strength" role="status">
                <div className="flex gap-2">
                  {[0, 1, 2, 3].map((index) => (
                    <span
                      className={cn(
                        "h-2 flex-1 rounded-full bg-slate-200 transition",
                        index < passwordStrength.score ? passwordStrength.color : "bg-slate-200",
                      )}
                      key={index}
                    />
                  ))}
                </div>
                <p className="text-sm text-slate-600">Strength: {password ? passwordStrength.label : "Enter a password"}</p>
              </div>
              <p className="min-h-5 text-sm text-rose-700" id="password-error">
                {errors.password?.message ?? ""}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                  aria-invalid={Boolean(errors.confirmPassword)}
                  autoComplete="new-password"
                  className="pr-12"
                  id="confirmPassword"
                  placeholder="Confirm your password"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                />
                <button
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  type="button"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="min-h-5 text-sm text-rose-700" id="confirm-password-error">
                {errors.confirmPassword?.message ?? ""}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Button className="min-w-44" disabled={isSubmitting} type="submit">
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner />
                  Creating account
                </span>
              ) : (
                "Create Account"
              )}
            </Button>
            <p className="text-sm text-slate-600">
              Already have an account?{" "}
              <Link className="font-semibold text-emerald-700 hover:text-emerald-800" href="/login">
                Login
              </Link>
            </p>
          </div>
        </form>
      </Card>

      {registrationResult ? (
        <RegistrationSuccessDialog
          apiKey={registrationResult.apiKey}
          email={registrationResult.email}
          onContinue={handleContinue}
          onCopy={handleCopyApiKey}
          onDownload={handleDownloadApiKey}
        />
      ) : null}
    </>
  );
}