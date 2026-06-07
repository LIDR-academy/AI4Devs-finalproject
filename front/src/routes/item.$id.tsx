import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ChevronLeft, Tag, Repeat, CalendarClock, Settings2, Sparkles } from "lucide-react";
import { pantryItems, priceComparison, daysUntil } from "@/lib/mock-data";

export const Route = createFileRoute("/item/$id")({
  component: ItemDetail,
});

function ItemDetail() {
  const { id } = useParams({ from: "/item/$id" });
  const item = pantryItems.find((i) => i.id === id) ?? pantryItems[0];
  const d = daysUntil(item.expiresAt);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md md:max-w-2xl pb-16">
        <header className="ios-blur sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b border-border/60">
          <Link to="/pantry" className="flex items-center gap-1 text-primary">
            <ChevronLeft className="size-5" />
            <span className="text-[16px]">Pantry</span>
          </Link>
          <button className="text-[15px] text-primary font-medium">Edit</button>
        </header>

        <div className="px-5 pt-8 text-center">
          <div className="mx-auto grid size-24 place-items-center rounded-3xl bg-secondary text-5xl shadow-ios">
            {item.emoji}
          </div>
          <h1 className="mt-5 text-2xl font-bold tracking-tight">{item.name}</h1>
          <p className="mt-1 text-[14px] text-muted-foreground">
            {item.quantity} · {item.category} · {item.location}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 px-5">
          <Stat label="Expires in" value={d < 0 ? `${Math.abs(d)}d ago` : `${d}d`} tone={d <= 2 ? "warn" : "ok"} />
          <Stat label="Paid" value={`€${item.pricePaid.toFixed(2)}`} />
          <Stat label="Added" value={new Date(item.addedAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })} />
        </div>

        {item.estimated && (
          <div className="mx-5 mt-5 flex items-start gap-3 rounded-2xl border border-warning/40 bg-warning/10 p-4">
            <Sparkles className="size-5 text-warning shrink-0" />
            <div className="text-[13.5px]">
              <p className="font-semibold">Estimated date</p>
              <p className="text-muted-foreground">AI guessed this from typical Spanish supermarket timelines. Set a real date to improve future suggestions.</p>
              <button className="mt-2 rounded-full bg-warning px-3 py-1 text-[12.5px] font-semibold text-warning-foreground">Set real date</button>
            </div>
          </div>
        )}

        <section className="mt-7 px-5">
          <h2 className="px-2 mb-2 text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">Actions</h2>
          <ul className="ios-card divide-y divide-border overflow-hidden">
            <ActionRow icon={<Tag className="size-4.5" />} label="Compare prices" sublabel={`From €${Math.min(...priceComparison.map(p=>p.price)).toFixed(2)} at ${priceComparison.find(p=>p.price===Math.min(...priceComparison.map(x=>x.price)))?.store}`} />
            <ActionRow icon={<Repeat className="size-4.5" />} label="Alternatives" sublabel="Plant-based, lower price, longer shelf life" />
            <ActionRow icon={<CalendarClock className="size-4.5" />} label="Change expiration date" />
            <ActionRow icon={<Settings2 className="size-4.5" />} label="Change default for this food" />
          </ul>
        </section>

        <section className="mt-6 px-5">
          <h2 className="px-2 mb-2 text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">Price across stores</h2>
          <div className="ios-card divide-y divide-border overflow-hidden">
            {priceComparison.sort((a,b)=>a.price-b.price).map((p, idx) => (
              <div key={p.brand} className="flex items-center justify-between px-4 py-3.5">
                <div>
                  <p className="text-[14.5px] font-medium">{p.brand}</p>
                  <p className="text-[12px] text-muted-foreground">{p.store}</p>
                </div>
                <div className="flex items-center gap-2">
                  {idx === 0 && <span className="rounded-full bg-success/20 px-2 py-0.5 text-[11px] font-semibold text-success">Best</span>}
                  <span className="text-[15px] font-semibold">€{p.price.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="px-5 mt-8">
          <button className="w-full rounded-2xl bg-destructive/10 text-destructive py-4 font-semibold text-[15px]">
            Mark as consumed
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "ok" | "warn" }) {
  return (
    <div className="ios-card p-3 text-center">
      <p className={`text-[16px] font-bold ${tone === "warn" ? "text-warning" : ""}`}>{value}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function ActionRow({ icon, label, sublabel }: { icon: React.ReactNode; label: string; sublabel?: string }) {
  return (
    <li className="flex items-center gap-3 px-4 py-3.5 active:bg-secondary/50 cursor-pointer">
      <div className="grid size-8 place-items-center rounded-lg bg-secondary text-primary">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[14.5px] font-medium">{label}</p>
        {sublabel && <p className="text-[12px] text-muted-foreground truncate">{sublabel}</p>}
      </div>
      <ChevronLeft className="size-4 rotate-180 text-muted-foreground" />
    </li>
  );
}
