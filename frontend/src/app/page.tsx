import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "IPFS Gateway | Decentralized File Storage",
  description:
    "Upload, retrieve, and manage files with a secure IPFS gateway designed for decentralized and permanent storage.",
};

export default function Home() {
  return (
    <div className="space-y-14 md:space-y-16">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-8 md:p-12">
        <div className="absolute -right-14 -top-14 h-48 w-48 rounded-full bg-emerald-200/40 blur-2xl" />
        <div className="absolute -bottom-16 left-10 h-52 w-52 rounded-full bg-teal-200/40 blur-2xl" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">IPFS Gateway Platform</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">Decentralized. Secure. Permanent.</h1>
          <p className="mt-4 max-w-2xl text-slate-700 md:text-lg">
            Store and access files through an API-first IPFS gateway that keeps your data durable, verifiable, and shareable across the web.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="ghost">Learn More</Button>
            </Link>
            <Link href="/upload">
              <Button variant="ghost">Try Upload</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3" id="features">
        <Card className="border-emerald-100 bg-emerald-50/40">
          <h2 className="text-lg font-semibold text-slate-900">Decentralized Storage</h2>
          <p className="mt-2 text-sm text-slate-700">
            Your files are content-addressed on IPFS, reducing single points of failure and improving integrity.
          </p>
        </Card>
        <Card className="border-teal-100 bg-teal-50/40">
          <h2 className="text-lg font-semibold text-slate-900">Secure by Design</h2>
          <p className="mt-2 text-sm text-slate-700">
            API key access and controlled workflows protect uploads and retrieval operations for your applications.
          </p>
        </Card>
        <Card className="border-cyan-100 bg-cyan-50/40">
          <h2 className="text-lg font-semibold text-slate-900">Permanent Access</h2>
          <p className="mt-2 text-sm text-slate-700">
            Persisted content IDs make sharing and retrieving files predictable for long-term use cases.
          </p>
        </Card>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8" id="how-it-works">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">How it works</h2>
        <p className="mt-3 max-w-2xl text-sm text-slate-600 md:text-base">
          Start in minutes with a simple workflow focused on onboarding and reliable file delivery.
        </p>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          <li className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Step 1</p>
            <p className="mt-2 font-semibold text-slate-900">Register</p>
            <p className="mt-1 text-sm text-slate-600">Create your account and generate credentials.</p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Step 2</p>
            <p className="mt-2 font-semibold text-slate-900">Upload</p>
            <p className="mt-1 text-sm text-slate-600">Send files to IPFS via upload endpoints.</p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Step 3</p>
            <p className="mt-2 font-semibold text-slate-900">Share or Retrieve</p>
            <p className="mt-1 text-sm text-slate-600">Reuse CID links or retrieve files anytime.</p>
          </li>
        </ol>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="text-xl font-semibold text-slate-900">Free plan to get started</h2>
          <p className="mt-2 text-sm text-slate-600">Start with the free tier and scale as your usage grows.</p>
          <ul className="mt-3 list-disc space-y-1 pl-6 text-sm text-slate-700">
            <li>Developer-friendly API</li>
            <li>IPFS-compatible upload and retrieval</li>
            <li>Dashboard-ready workflows</li>
          </ul>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-slate-900">Quick links</h2>
          <p className="mt-2 text-sm text-slate-600">Jump directly to product docs and core flows.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/docs">
              <Button variant="ghost">Documentation</Button>
            </Link>
            <Link href="/retrieve">
              <Button variant="ghost">Retrieve Files</Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost">Login/Register</Button>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
