import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Users, Mail, Link2, Copy, Check, Crown, Eye, Pencil, Trash2, X, UserPlus, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/sharing")({
  head: () => ({ meta: [{ title: "Shared Pantry — RealSaveFooding" }] }),
  component: SharingPage,
});

type Role = "owner" | "editor" | "viewer";
type Member = { id: string; name: string; email: string; role: Role; initial: string; you?: boolean };
type Invite = { id: string; email: string; role: Role; sentAt: string };

const initialMembers: Member[] = [
  { id: "m1", name: "Alex Garcia", email: "alex@example.com", role: "owner", initial: "A", you: true },
  { id: "m2", name: "Maria Lopez", email: "maria@example.com", role: "editor", initial: "M" },
  { id: "m3", name: "Diego Ruiz", email: "diego@example.com", role: "viewer", initial: "D" },
];

const initialInvites: Invite[] = [
  { id: "i1", email: "sofia@example.com", role: "editor", sentAt: "2h ago" },
];

function SharingPage() {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [invites, setInvites] = useState<Invite[]>(initialInvites);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("editor");
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"email" | "link">("email");

  const inviteLink = "https://realsavefooding.app/join/9F4K-2QXP";

  const sendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setInvites([{ id: Math.random().toString(36).slice(2), email, role, sentAt: "just now" }, ...invites]);
    setEmail("");
  };

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(inviteLink); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const changeRole = (id: string, r: Role) =>
    setMembers(members.map((m) => (m.id === id ? { ...m, role: r } : m)));

  const removeMember = (id: string) => setMembers(members.filter((m) => m.id !== id));
  const cancelInvite = (id: string) => setInvites(invites.filter((i) => i.id !== id));

  return (
    <AppShell title="Shared Pantry">
      <p className="text-[14px] text-muted-foreground mb-5">
        Share your pantry with family or roommates. Everyone sees the same items and expiration alerts.
      </p>

      {/* Invite */}
      <section className="ios-card p-4 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <UserPlus className="size-4 text-primary" />
          <h2 className="font-semibold text-[15px]">Invite someone</h2>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-1 rounded-xl bg-secondary p-1">
          {([
            { id: "email", label: "By email", Icon: Mail },
            { id: "link", label: "Share link", Icon: Link2 },
          ] as const).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-lg py-2 text-[13px] font-medium transition",
                tab === t.id ? "bg-surface shadow-ios" : "text-muted-foreground"
              )}
            >
              <t.Icon className="size-3.5" /> {t.label}
            </button>
          ))}
        </div>

        {tab === "email" ? (
          <form onSubmit={sendInvite} className="space-y-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-[15px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
            <RolePicker value={role} onChange={setRole} />
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-[15px] font-semibold text-primary-foreground shadow-ios active:scale-[0.98] transition"
            >
              <Mail className="size-4" /> Send invite
            </button>
          </form>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-3 py-2.5">
              <Link2 className="size-4 text-muted-foreground shrink-0" />
              <span className="truncate text-[13.5px] flex-1">{inviteLink}</span>
              <button onClick={copyLink} className="flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1.5 text-[12.5px] font-medium">
                {copied ? <><Check className="size-3.5 text-success" /> Copied</> : <><Copy className="size-3.5" /> Copy</>}
              </button>
            </div>
            <RolePicker value={role} onChange={setRole} />
            <p className="text-[12px] text-muted-foreground px-1">
              Anyone with this link can join as <span className="font-medium">{role}</span>. Link expires in 7 days.
            </p>
            <button
              onClick={copyLink}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-[15px] font-semibold text-primary-foreground shadow-ios active:scale-[0.98] transition"
            >
              <Share2 className="size-4" /> Share link
            </button>
          </div>
        )}
      </section>

      {/* Pending invites */}
      {invites.length > 0 && (
        <section className="mb-5">
          <h2 className="px-2 mb-2 text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">
            Pending invites
          </h2>
          <div className="ios-card divide-y divide-border overflow-hidden">
            {invites.map((i) => (
              <div key={i.id} className="flex items-center gap-3 px-4 py-3">
                <div className="grid size-9 place-items-center rounded-full bg-warning/15 text-warning-foreground">
                  <Mail className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-[14.5px] font-medium">{i.email}</p>
                  <p className="text-[12px] text-muted-foreground capitalize">{i.role} · sent {i.sentAt}</p>
                </div>
                <button onClick={() => cancelInvite(i.id)} className="grid size-8 place-items-center rounded-full bg-secondary text-muted-foreground">
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Members */}
      <section className="mb-5">
        <h2 className="px-2 mb-2 flex items-center gap-1.5 text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">
          <Users className="size-3.5" /> Members ({members.length})
        </h2>
        <div className="ios-card divide-y divide-border overflow-hidden">
          {members.map((m) => (
            <MemberRow key={m.id} member={m} onChangeRole={(r) => changeRole(m.id, r)} onRemove={() => removeMember(m.id)} />
          ))}
        </div>
      </section>

      {/* Access info */}
      <section className="ios-card p-4 mb-5">
        <h3 className="font-semibold text-[14px] mb-2">Role permissions</h3>
        <ul className="space-y-2 text-[13px] text-muted-foreground">
          <li className="flex gap-2"><Crown className="size-4 text-warning shrink-0 mt-0.5" /><span><span className="text-foreground font-medium">Owner</span> · manages members, billing & deletion</span></li>
          <li className="flex gap-2"><Pencil className="size-4 text-primary shrink-0 mt-0.5" /><span><span className="text-foreground font-medium">Editor</span> · add, edit & remove pantry items</span></li>
          <li className="flex gap-2"><Eye className="size-4 text-muted-foreground shrink-0 mt-0.5" /><span><span className="text-foreground font-medium">Viewer</span> · read-only access, gets expiration alerts</span></li>
        </ul>
      </section>

      <button className="w-full rounded-2xl bg-destructive/10 text-destructive py-3.5 font-semibold text-[14.5px]">
        Leave shared pantry
      </button>
    </AppShell>
  );
}

function MemberRow({ member, onChangeRole, onRemove }: { member: Member; onChangeRole: (r: Role) => void; onRemove: () => void }) {
  const RoleIcon = member.role === "owner" ? Crown : member.role === "editor" ? Pencil : Eye;
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground font-semibold">
        {member.initial}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-[14.5px] font-semibold">{member.name}</p>
          {member.you && <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">You</span>}
        </div>
        <p className="truncate text-[12px] text-muted-foreground">{member.email}</p>
      </div>
      {member.role === "owner" ? (
        <span className="flex items-center gap-1 rounded-full bg-warning/15 px-2.5 py-1 text-[11.5px] font-medium text-warning-foreground border border-warning/30">
          <RoleIcon className="size-3" /> Owner
        </span>
      ) : (
        <div className="flex items-center gap-1">
          <select
            value={member.role}
            onChange={(e) => onChangeRole(e.target.value as Role)}
            className="rounded-full bg-secondary px-2.5 py-1 text-[12px] font-medium outline-none"
          >
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
          <button onClick={onRemove} className="grid size-8 place-items-center rounded-full bg-secondary text-destructive">
            <Trash2 className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

function RolePicker({ value, onChange }: { value: Role; onChange: (r: Role) => void }) {
  const opts: { id: Role; label: string; Icon: typeof Eye; desc: string }[] = [
    { id: "editor", label: "Editor", Icon: Pencil, desc: "Can add & edit" },
    { id: "viewer", label: "Viewer", Icon: Eye, desc: "Read-only" },
  ];
  return (
    <div className="grid grid-cols-2 gap-2">
      {opts.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={cn(
            "flex items-start gap-2 rounded-2xl border p-3 text-left transition",
            value === o.id ? "border-primary bg-primary/5" : "border-border bg-surface"
          )}
        >
          <o.Icon className={cn("size-4 mt-0.5", value === o.id ? "text-primary" : "text-muted-foreground")} />
          <div>
            <p className="text-[13.5px] font-semibold">{o.label}</p>
            <p className="text-[11.5px] text-muted-foreground">{o.desc}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
