import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Users, Mail, Crown, UserPlus, RefreshCw } from "lucide-react";
import {
  requireAuthBeforeLoad,
  useRequireAuthRedirect,
} from "@/features/auth/route-guard";
import {
  HouseholdTransferRequiredError,
  acceptInvitation,
  createHousehold,
  createInvitation,
  getMyHousehold,
  listHouseholdInvitations,
  listMembers,
  listPendingInvitations,
  transferOwnership,
  type HouseholdResponse,
  type InvitationResponse,
  type MemberResponse,
  type TransferMemberOption,
} from "@/features/households/households.api";
import { getSessionUser } from "@/features/auth/session";

export const Route = createFileRoute("/sharing")({
  beforeLoad: requireAuthBeforeLoad,
  head: () => ({ meta: [{ title: "Shared Pantry — RealSaveFooding" }] }),
  component: SharingPage,
});

function SharingPage() {
  const authed = useRequireAuthRedirect();
  if (!authed) return null;

  const sessionUser = getSessionUser();

  const [household, setHousehold] = useState<HouseholdResponse | null | undefined>(undefined);
  const [members, setMembers] = useState<MemberResponse[]>([]);
  const [sentInvitations, setSentInvitations] = useState<InvitationResponse[]>([]);
  const [pendingForMe, setPendingForMe] = useState<InvitationResponse[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [householdName, setHouseholdName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transferState, setTransferState] = useState<{
    invitationId: string;
    householdId: string;
    householdName: string;
    members: TransferMemberOption[];
  } | null>(null);

  async function load() {
    setIsLoading(true);
    setError(null);
    try {
      const [hh, mine] = await Promise.all([
        getMyHousehold(),
        listPendingInvitations(),
      ]);
      setHousehold(hh);
      setPendingForMe(mine);
      if (hh) {
        const [m, inv] = await Promise.all([
          listMembers(hh.id),
          listHouseholdInvitations(hh.id),
        ]);
        setMembers(m);
        setSentInvitations(inv);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load sharing data.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function handleCreateHousehold(e: React.FormEvent) {
    e.preventDefault();
    if (!householdName.trim()) return;
    setIsBusy(true);
    setError(null);
    try {
      await createHousehold(householdName.trim());
      setHouseholdName("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create household.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleSendInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!household || !inviteEmail.includes("@")) return;
    setIsBusy(true);
    setError(null);
    try {
      await createInvitation(household.id, inviteEmail.trim());
      setInviteEmail("");
      const inv = await listHouseholdInvitations(household.id);
      setSentInvitations(inv);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invitation.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleAcceptInvitation(invitationId: string) {
    setIsBusy(true);
    setError(null);
    try {
      await acceptInvitation(invitationId);
      await load();
    } catch (err) {
      if (err instanceof HouseholdTransferRequiredError) {
        setTransferState({
          invitationId: err.invitationId,
          householdId: err.currentHouseholdId,
          householdName: err.currentHouseholdName,
          members: err.members,
        });
      } else {
        setError(err instanceof Error ? err.message : "Failed to accept invitation.");
      }
    } finally {
      setIsBusy(false);
    }
  }

  async function handleTransferAndJoin(newOwnerUserId: string) {
    if (!transferState) return;
    setIsBusy(true);
    setError(null);
    try {
      await transferOwnership(transferState.householdId, newOwnerUserId);
      await acceptInvitation(transferState.invitationId);
      setTransferState(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to transfer ownership and join.");
    } finally {
      setIsBusy(false);
    }
  }

  if (isLoading) {
    return (
      <AppShell title="Shared Pantry">
        <p className="text-muted-foreground text-[14px]">Loading…</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="Shared Pantry">
      <p className="text-[14px] text-muted-foreground mb-5">
        Share your pantry with a household member so you both see the same items.
      </p>

      {error && (
        <div
          data-testid="sharing-error"
          className="mb-4 rounded-xl bg-destructive/10 px-4 py-3 text-[13.5px] text-destructive"
        >
          {error}
        </div>
      )}

      {/* ── Ownership transfer required ── */}
      {transferState && (
        <section
          data-testid="sharing-transfer-ownership-section"
          className="mb-5 ios-card p-4 border border-destructive/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <Crown className="size-4 text-destructive" />
            <h2 className="font-semibold text-[15px]">Transfer household ownership</h2>
          </div>
          <p className="text-[13px] text-muted-foreground mb-3">
            You are the owner of <strong>{transferState.householdName}</strong>. To join the new
            household you must first assign a new owner. Choose a member:
          </p>
          <div className="space-y-2 mb-3">
            {transferState.members.map((m) => (
              <button
                key={m.userId}
                data-testid={`sharing-transfer-owner-${m.userId}`}
                onClick={() => void handleTransferAndJoin(m.userId)}
                disabled={isBusy}
                className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 text-left text-[14px] hover:bg-secondary disabled:opacity-60"
              >
                <div className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground font-semibold text-[14px]">
                  {m.email[0].toUpperCase()}
                </div>
                <span className="flex-1 truncate">{m.email}</span>
                <span className="text-[12px] text-muted-foreground">Make owner &amp; leave</span>
              </button>
            ))}
          </div>
          <button
            data-testid="sharing-transfer-cancel"
            onClick={() => setTransferState(null)}
            disabled={isBusy}
            className="text-[13px] text-muted-foreground underline underline-offset-2 disabled:opacity-60"
          >
            Cancel
          </button>
        </section>
      )}

      {/* ── Pending invitations FOR me ── */}
      {pendingForMe.length > 0 && (
        <section className="mb-5" data-testid="sharing-incoming-invitations">
          <h2 className="px-2 mb-2 text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">
            Invitations for you
          </h2>
          <div className="ios-card divide-y divide-border overflow-hidden">
            {pendingForMe.map((inv) => (
              <div
                key={inv.id}
                data-testid={`sharing-incoming-invitation-${inv.id}`}
                className="flex items-center gap-3 px-4 py-3"
              >
                <div className="grid size-9 place-items-center rounded-full bg-primary/10">
                  <Mail className="size-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium">Household invitation</p>
                  <p className="text-[12px] text-muted-foreground truncate">
                    Sent to {inv.inviteeEmail}
                  </p>
                </div>
                <button
                  data-testid={`sharing-accept-invitation-${inv.id}`}
                  onClick={() => void handleAcceptInvitation(inv.id)}
                  disabled={isBusy}
                  className="rounded-xl bg-primary px-3 py-2 text-[13px] font-semibold text-primary-foreground disabled:opacity-60"
                >
                  Accept
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── No household yet ── */}
      {household === null && pendingForMe.length === 0 && (
        <section
          data-testid="sharing-no-household"
          className="ios-card p-4 mb-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <UserPlus className="size-4 text-primary" />
            <h2 className="font-semibold text-[15px]">Create a household</h2>
          </div>
          <p className="text-[13px] text-muted-foreground mb-3">
            Start a household to invite a family member or roommate.
          </p>
          <form onSubmit={handleCreateHousehold} className="space-y-2">
            <input
              data-testid="sharing-household-name-input"
              type="text"
              value={householdName}
              onChange={(e) => setHouseholdName(e.target.value)}
              placeholder="Household name (e.g. Home)"
              className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-[15px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
            <button
              data-testid="sharing-create-household-button"
              type="submit"
              disabled={isBusy || !householdName.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-[15px] font-semibold text-primary-foreground shadow-ios active:scale-[0.98] transition disabled:opacity-60"
            >
              Create household
            </button>
          </form>
        </section>
      )}

      {/* ── Household exists: Invite section ── */}
      {household && (
        <>
          <div className="flex items-center justify-between mb-1 px-1">
            <span className="text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">
              Your household
            </span>
            <button
              data-testid="sharing-refresh-button"
              onClick={() => void load()}
              disabled={isLoading || isBusy}
              className="flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground disabled:opacity-50"
              aria-label="Refresh sharing data"
            >
              <RefreshCw className="size-3.5" /> Refresh
            </button>
          </div>
          <section className="ios-card p-4 mb-5">
            <div className="flex items-center gap-2 mb-1">
              <UserPlus className="size-4 text-primary" />
              <h2 className="font-semibold text-[15px]">Invite someone</h2>
            </div>
            <p
              data-testid="sharing-household-name"
              className="text-[12px] text-muted-foreground mb-3"
            >
              Household: {household.name}
            </p>
            <form onSubmit={handleSendInvite} className="space-y-2">
              <input
                data-testid="sharing-invite-email-input"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-[15px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
              <button
                data-testid="sharing-invite-submit"
                type="submit"
                disabled={isBusy || !inviteEmail.includes("@")}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-[15px] font-semibold text-primary-foreground shadow-ios active:scale-[0.98] transition disabled:opacity-60"
              >
                <Mail className="size-4" /> Send invite
              </button>
            </form>
          </section>

          {/* Pending sent invitations */}
          {sentInvitations.length > 0 && (
            <section className="mb-5" data-testid="sharing-pending-invitations">
              <h2 className="px-2 mb-2 text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">
                Pending invites
              </h2>
              <div className="ios-card divide-y divide-border overflow-hidden">
                {sentInvitations.map((inv) => (
                  <div
                    key={inv.id}
                    data-testid={`sharing-sent-invitation-${inv.id}`}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <div className="grid size-9 place-items-center rounded-full bg-warning/15">
                      <Mail className="size-4 text-warning-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-[14.5px] font-medium">{inv.inviteeEmail}</p>
                      <p className="text-[12px] text-muted-foreground">
                        Pending · expires {new Date(inv.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Members list */}
          <section className="mb-5">
            <h2
              className="px-2 mb-2 flex items-center gap-1.5 text-[12px] uppercase tracking-wider text-muted-foreground font-semibold"
            >
              <Users className="size-3.5" /> Members ({members.length})
            </h2>
            <div className="ios-card divide-y divide-border overflow-hidden" data-testid="sharing-members-list">
              {members.map((m) => (
                <div
                  key={m.id}
                  data-testid={`sharing-member-${m.userId}`}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <div className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground font-semibold text-[15px]">
                    {m.email[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-[14.5px] font-semibold">{m.email}</p>
                      {m.userId === sessionUser?.id && (
                        <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-muted-foreground capitalize">{m.role.toLowerCase()}</p>
                  </div>
                  {m.role === "OWNER" && (
                    <span className="flex items-center gap-1 rounded-full bg-warning/15 px-2.5 py-1 text-[11.5px] font-medium text-warning-foreground border border-warning/30">
                      <Crown className="size-3" /> Owner
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </AppShell>
  );
}
