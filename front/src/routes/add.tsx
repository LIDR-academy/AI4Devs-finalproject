import {
  createFileRoute,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { ScanLine, Camera, PencilLine, Mic } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  requireAuthBeforeLoad,
  useRequireAuthRedirect,
} from "@/features/auth/route-guard";

export const Route = createFileRoute("/add")({
  beforeLoad: requireAuthBeforeLoad,
  component: AddPage,
});

function AddPage() {
  const authed = useRequireAuthRedirect();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (!authed) {
    return null;
  }

  // /add.manual.tsx is a child route of /add; render children explicitly.
  if (pathname.startsWith("/add/manual")) {
    return <Outlet />;
  }

  return (
    <AppShell title="Add">
      <p className="text-[15px] text-muted-foreground mb-5">Pick a way to add items to your pantry.</p>

      <div className="grid grid-cols-2 gap-3">
        <BigOption icon={<ScanLine className="size-7" />} title="Scan receipt" body="AI extracts items & expirations" primary />
        <BigOption icon={<Camera className="size-7" />} title="Photo of product" body="Identify a single item" />
        <BigOption
          icon={<PencilLine className="size-7" />}
          title="Manual entry"
          body="Type it yourself"
          to="/add/manual"
          onNavigate={(to) => navigate({ to })}
        />
        <BigOption icon={<Mic className="size-7" />} title="Voice add" body="Say what you bought" />
      </div>

      <section className="mt-8">
        <h2 className="px-2 mb-2 text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">Recently added</h2>
        <div className="ios-card divide-y divide-border overflow-hidden">
          {["🥕 Carrots — 500g", "🧀 Manchego — 250g", "🍎 Apples — 6 ct"].map((t) => (
            <div key={t} className="flex items-center justify-between px-4 py-3.5 text-[14.5px]">
              <span>{t}</span>
              <span className="text-[12px] text-muted-foreground">just now</span>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

function BigOption({
  icon,
  title,
  body,
  primary,
  to,
  onNavigate,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  primary?: boolean;
  to?: string;
  onNavigate?: (to: "/add/manual") => void;
}) {
  const className = `ios-card flex flex-col items-start gap-2 p-5 text-left active:scale-[0.98] transition ${primary ? "bg-primary text-primary-foreground" : ""}`;
  const inner = (
    <>
      <div className={`grid size-12 place-items-center rounded-2xl ${primary ? "bg-primary-foreground/15" : "bg-secondary text-primary"}`}>
        {icon}
      </div>
      <p className="mt-1 text-[15px] font-semibold">{title}</p>
      <p className={`text-[12.5px] ${primary ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{body}</p>
    </>
  );
  if (to) {
    return (
      <button
        type="button"
        className={className}
        onClick={() => {
          if (onNavigate) {
            onNavigate(to as "/add/manual");
          }
        }}
      >
        {inner}
      </button>
    );
  }
  return <button type="button" className={className}>{inner}</button>;
}
