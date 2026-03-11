import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">IPFS Gateway Frontend</h1>
        <p className="mt-3 max-w-2xl text-slate-700">
          US-101 establishes the Next.js 16 foundation, API client layer, reusable UI primitives,
          and testing baseline for all upcoming frontend user stories.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/upload">
            <Button>Go to Upload</Button>
          </Link>
          <Link href="/docs">
            <Button variant="ghost">View Docs Page</Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Type-Safe Foundation</h2>
          <p className="mt-2 text-sm text-slate-600">Strict TypeScript and shared domain types are ready.</p>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">API Client Layer</h2>
          <p className="mt-2 text-sm text-slate-600">Axios-based client with typed contracts and helper methods.</p>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Testing Baseline</h2>
          <p className="mt-2 text-sm text-slate-600">Jest + Playwright setup to protect against regressions.</p>
        </Card>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Next milestones</h2>
        <ul className="mt-3 list-disc space-y-1 pl-6 text-sm text-slate-700">
          <li>US-102: Home page and navigation refinement</li>
          <li>US-103: Registration flow with API key reveal</li>
          <li>US-104: Login and dashboard integration</li>
        </ul>
      </section>
    </div>
  );
}
