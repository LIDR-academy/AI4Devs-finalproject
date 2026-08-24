<?php

namespace App\Actions\Auth;

use App\Models\Role;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;

/**
 * Story 0015b — the single implementation of "log a refused privileged
 * attempt", reused by every Gate::authorize() call and every
 * ValidationException/direct-throw refusal enumerated in
 * ai-spec/tasks/in-progress/0015b-log-refused-privileged-attempts.md across
 * App\Livewire\Users\Index, App\Livewire\Roles\Index, and the five domain
 * actions the task file's Q5 decision brings into scope (CreateUser,
 * UpdateUser, RequestEmailChange, EnforceAdministratorPermissionGrant,
 * EnforceGrantorPermissionScope).
 *
 * Modeled on App\Actions\Auth\EnsureRecentPasswordConfirmation's own shape:
 * a throwing wrapper (authorize()) for the Gate-shaped sites, plus a
 * non-throwing recorder (log()) for the ValidationException/direct-throw
 * sites, so the "warn" half and the "enforce" half can never drift apart —
 * authorize()'s own Gate::authorize()/Gate::forUser()->authorize() call is
 * exactly what throws today, unchanged in class, message or status. For a
 * non-Gate refusal (a rate limiter, the self-lockout check, the
 * holders-remaining check, a direct AuthorizationException throw), the call
 * site evaluates its own existing condition and calls log() itself,
 * immediately before the existing `throw` — never a second, independent
 * check that could disagree with it.
 *
 * Logs at Log::warning (task file decision Q1) to the default channel (Q3),
 * unthrottled (Q4): a refusal costs an attacker nothing, and losing entries
 * here would defeat the story's whole purpose at this backoffice's traffic
 * scale — a future scale problem finds its answer already recorded here
 * rather than needing to re-derive it: throttling would have to be
 * per-actor/per-ability with its own suppression counter, which is more
 * code and a blind spot in exactly the window that matters, for a traffic
 * ceiling this app does not have today.
 *
 * Phase 5 review note (informational, not a defect): authorize() evaluates
 * the Gate ability twice on every call — once via denies() to decide whether
 * to log, once via the real authorize() that actually throws — including on
 * the success path, where denies() runs and finds nothing to log. This is an
 * accepted, correctness-neutral cost, chosen deliberately over wrapping the
 * real authorize() call in a try/catch: a catch around Gate::authorize()
 * would also intercept an AuthorizationException thrown by unrelated,
 * nested authorization logic further down the call stack, misattributing it
 * to this ability.
 */
class LogRefusedPrivilegedAttempt
{
    /**
     * Authorize a Gate-shaped operation, logging a refusal before the
     * underlying Gate::authorize() throws.
     *
     * $actor defaults to Auth::user() when omitted, matching the plain
     * Gate::authorize() call this replaces at every Livewire component call
     * site. An explicit $actor is required by
     * App\Actions\Roles\EnforceAdministratorPermissionGrant and
     * EnforceGrantorPermissionScope, which authorize against a parameter
     * rather than the authenticated user — so a non-dashboard caller (a
     * queued job, an Artisan command) still logs a correctly-attributed
     * `actor_id` rather than a null Auth::id() (task file Q2 revision,
     * finding B3).
     *
     * $targetType / $targetId identify the LOGGED target and are resolved
     * automatically from $gateTarget when it is a User or Role instance;
     * pass them explicitly only when the two diverge —
     * EnforceAdministratorPermissionGrant authorizes against the Role
     * CLASS (a class-level ability, no specific row) while still wanting
     * the role actually being edited attributed in the log.
     *
     * @throws AuthorizationException
     */
    public function authorize(
        string $ability,
        mixed $gateTarget,
        ?User $actor = null,
        ?string $targetType = null,
        int|string|null $targetId = null,
    ): void {
        $resolvedActor = $actor ?? Auth::user();
        $gate = Gate::forUser($resolvedActor);

        if ($gate->denies($ability, $gateTarget)) {
            [$resolvedType, $resolvedId] = $this->resolveTarget($gateTarget, $targetType, $targetId);

            $this->log($resolvedActor, $ability, $resolvedType, $resolvedId);
        }

        // The exact same check Gate::authorize() has always performed at
        // this site — denies() above never substitutes for it, so a
        // refusal still throws the identical AuthorizationException, with
        // the identical message and status, that it did before this class
        // existed.
        $gate->authorize($ability, $gateTarget);
    }

    /**
     * Record a refusal directly — the non-Gate half, called immediately
     * before an existing `throw` (a rate limiter, the self-lockout check,
     * the holders-remaining check, or a direct AuthorizationException) so
     * the log entry and the refusal it describes can never disagree about
     * whether the attempt was actually refused. This method never throws.
     *
     * Records only who attempted what against which target — never a
     * password, an invitation token, an email-change hash or a session
     * identifier — matching this app's existing audit-trail lines
     * (App\Livewire\Users\Index / App\Livewire\Roles\Index's own
     * Log::info success lines).
     */
    public function log(?User $actor, string $ability, ?string $targetType = null, int|string|null $targetId = null): void
    {
        Log::warning('Privileged action refused', [
            'actor_id' => $actor?->id,
            'ability' => $ability,
            'target_type' => $targetType,
            'target_id' => $targetId,
        ]);
    }

    /**
     * Resolve the logged target from the Gate target, unless the caller
     * already supplied one explicitly (the class-level-ability-but-known-
     * row case above).
     *
     * @return array{0: ?string, 1: int|string|null}
     */
    private function resolveTarget(mixed $gateTarget, ?string $targetType, int|string|null $targetId): array
    {
        if ($targetType !== null || $targetId !== null) {
            return [$targetType, $targetId];
        }

        if ($gateTarget instanceof User) {
            return ['user', $gateTarget->id];
        }

        if ($gateTarget instanceof Role) {
            return ['role', $gateTarget->id];
        }

        return [null, null];
    }
}
