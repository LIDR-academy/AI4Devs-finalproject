import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to IPFS Gateway using your API key.",
};

export default function LoginPage() {
  return (
    <section className="mx-auto max-w-3xl">
      <LoginForm />
    </section>
  );
}
