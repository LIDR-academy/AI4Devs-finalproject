import { createFileRoute } from "@tanstack/react-router";
import { TrendingDown, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { wastedThisMonth, wasteByWeek, topWastedFoods } from "@/lib/mock-data";

export const Route = createFileRoute("/insights")({
  component: InsightsPage,
});

function InsightsPage() {
  const max = Math.max(...wasteByWeek.map((w) => w.value));
  const improving = wastedThisMonth.vsLastMonth < 0;

  return (
    <AppShell title="Insights">
      <div className="ios-card p-5">
        <p className="text-[12.5px] uppercase tracking-wider text-muted-foreground font-semibold">Wasted this month</p>
        <div className="mt-2 flex items-end justify-between">
          <p className="text-[40px] font-bold tracking-tight leading-none">€{wastedThisMonth.moneyLost.toFixed(2)}</p>
          <div className={`flex items-center gap-1 text-[13px] font-semibold ${improving ? "text-success" : "text-destructive"}`}>
            {improving ? <TrendingDown className="size-4" /> : <TrendingUp className="size-4" />}
            {Math.abs(wastedThisMonth.vsLastMonth)}%
          </div>
        </div>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {wastedThisMonth.itemsLost} items · {wastedThisMonth.weightKg}kg
        </p>

        <div className="mt-6 flex items-end gap-2 h-32">
          {wasteByWeek.map((w) => (
            <div key={w.label} className="flex-1 flex flex-col items-center gap-1.5">
              <div
                className="w-full rounded-t-lg bg-primary/80"
                style={{ height: `${(w.value / max) * 100}%` }}
              />
              <span className="text-[11px] text-muted-foreground">{w.label}</span>
            </div>
          ))}
        </div>
      </div>

      <section className="mt-6">
        <h2 className="px-2 mb-2 text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">Top wasted foods</h2>
        <p className="px-2 mb-3 text-[12px] text-muted-foreground">You vs. community average</p>
        <div className="ios-card overflow-hidden">
          {topWastedFoods.map((f, idx) => {
            const maxRow = Math.max(f.you, f.avg);
            return (
              <div key={f.name} className={`px-4 py-3 ${idx > 0 ? "border-t border-border" : ""}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{f.emoji}</span>
                    <span className="text-[14px] font-medium">{f.name}</span>
                  </div>
                  <span className="text-[12px] text-muted-foreground">{f.you} / {f.avg}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${(f.you / maxRow) * 100}%` }} />
                  </div>
                  <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-muted-foreground/50" style={{ width: `${(f.avg / maxRow) * 100}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex gap-4 px-2 text-[11.5px] text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" /> You</span>
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-muted-foreground/50" /> Community avg</span>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="px-2 mb-2 text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">Group by</h2>
        <div className="grid grid-cols-3 gap-2">
          {["Day", "Week", "Month"].map((g) => (
            <button key={g} className="ios-card py-3 text-[13.5px] font-medium">{g}</button>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
