import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Leaf, ScanLine, BellRing, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RealSaveFooding — Stop Wasting Food & Money" },
      { name: "description", content: "Track expirations, scan receipts, compare prices, and cut food waste." },
      { property: "og:title", content: "RealSaveFooding" },
      { property: "og:description", content: "Stop wasting food and money." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md px-6 pt-16 pb-12">
        <div className="flex items-center gap-2 text-primary">
          <div className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-ios">
            <Leaf className="size-6" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">RealSaveFooding</span>
        </div>

        <h1 className="mt-10 text-[40px] font-bold leading-[1.05] tracking-tight">
          Stop wasting<br />food &amp; money.
        </h1>
        <p className="mt-4 text-[17px] text-muted-foreground leading-snug">
          Smart pantry tracking, AI-estimated expirations, and price comparisons across Spanish supermarkets.
        </p>

        <div className="mt-10 space-y-3">
          <Feature icon={<ScanLine className="size-5" />} title="Scan your receipt" body="AI adds items and estimates expirations." />
          <Feature icon={<BellRing className="size-5" />} title="Never miss a date" body="Gentle reminders before food goes bad." />
          <Feature icon={<Leaf className="size-5" />} title="Track what you save" body="See money saved and waste avoided." />
        </div>

        <div className="mt-12 space-y-3">
          <Link
            to="/pantry"
            className="flex w-full items-center justify-center rounded-2xl bg-primary px-5 py-4 text-[17px] font-semibold text-primary-foreground shadow-ios transition-transform active:scale-[0.98]"
          >
            Get started
          </Link>
          <Link
            to="/auth"
            className="flex w-full items-center justify-center rounded-2xl bg-secondary px-5 py-4 text-[17px] font-semibold text-secondary-foreground"
          >
            I already have an account
          </Link>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="ios-card flex items-center gap-4 p-4">
      <div className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">{icon}</div>
      <div className="flex-1">
        <p className="font-semibold text-[15px]">{title}</p>
        <p className="text-[13px] text-muted-foreground">{body}</p>
      </div>
      <ChevronRight className="size-4 text-muted-foreground" />
    </div>
  );
}
