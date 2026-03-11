import type { Metadata } from "next";

import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Register for IPFS Gateway and receive your one-time API key.",
};

export default function RegisterPage() {
  return (
    <section className="mx-auto max-w-3xl">
      <RegisterForm />
    </section>
  );
}
