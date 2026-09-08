<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\UserStatus;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

/**
 * @property string $id
 * @property string $name
 * @property string $email
 * @property string|null $pending_email
 * @property Carbon|null $email_verified_at
 * @property UserStatus $status
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, HasUuids, Notifiable, PasskeyAuthenticatable, SoftDeletes, TwoFactorAuthenticatable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'status' => UserStatus::class,
            'deleted_at' => 'datetime',
        ];
    }

    /**
     * Soft-delete the user, obfuscating their email address first.
     *
     * Frees the original (and any still-pending) address for reuse by a new
     * user and prevents the outstanding pending-email confirmation link from
     * writing a live address back onto a trashed row. The placeholder is
     * anchored to the immutable UUID `id`, so it is collision-proof and
     * reproduces identically if a restored user is deleted again.
     *
     * The `! $this->exists` guard is required: without it, a non-persisted
     * instance's delete() (including the one forceDelete() calls internally,
     * per SoftDeletes) would run saveQuietly() against a model with no row,
     * phantom-inserting an obfuscated user instead of doing nothing.
     *
     * forceDelete() routes through this method (SoftDeletes calls delete()
     * internally when force-deleting), so a hard delete also pays for this
     * obfuscation write immediately before the row is physically removed.
     * That is wasteful but harmless — the row is gone either way — and is
     * left as-is rather than special-cased.
     *
     * Known limitation: a restored user (via SoftDeletes::restore(), which
     * this app has no call site for yet) keeps the obfuscated email. A future
     * restore flow must have the administrator re-enter the address, which
     * — per story 0003 — goes through the pending-email confirmation flow.
     *
     * Also revokes any outstanding `password_reset_tokens` row bound to the
     * account's real (pre-obfuscation) `email`. That table is keyed purely by
     * the email string, with no foreign key to `users`, so freeing the
     * address for reuse without also deleting the token would let a
     * still-valid reset link (issued to the deleted user, or to the
     * administrator on their behalf via App\Actions\Users\CreateUser's
     * invitation) resolve against whichever new account later claims the
     * recycled address within the token's window — an account takeover of
     * that new owner (see docs/errors-log.md). `pending_email` needs no
     * equivalent cleanup: it is never looked up by Fortify's password broker
     * (only `email` is), and its own verification link is a signed URL, not a
     * `password_reset_tokens` row, so no stale reference to it can exist in
     * that table.
     *
     * This override only fires on instance deletion — `$user->delete()` (and
     * `$user->forceDelete()`, which routes through it per SoftDeletes) both go
     * through Eloquent and hit this method. A bulk `User::where(...)->delete()`
     * via the query builder bypasses the model entirely and so skips this
     * override completely, leaving the affected rows' emails un-obfuscated and
     * any outstanding `password_reset_tokens` rows live — never use bulk
     * delete against `users`.
     */
    public function delete(): bool
    {
        if (! $this->exists) {
            return (bool) parent::delete();
        }

        return DB::transaction(function (): bool {
            $originalEmail = $this->getRawOriginal('email');

            DB::table('password_reset_tokens')
                ->whereIn('email', array_unique([$originalEmail, Str::lower($originalEmail)]))
                ->delete();

            $this->forceFill([
                'email' => "deleted+{$this->id}@deleted.invalid",
                'email_verified_at' => null,
                'pending_email' => null,
            ])->saveQuietly();

            return (bool) parent::delete();
        });
    }

    /**
     * Lowercase the email address on read.
     *
     * This is a read-only consistency layer for any row that could carry a
     * mixed-case address; it deliberately does not replace the
     * normalise-before-validation step performed by the callers that write
     * to this column (see App\Actions\Users\RequestEmailChange and
     * App\Livewire\Settings\Profile).
     *
     * @return Attribute<string, never>
     */
    protected function email(): Attribute
    {
        return Attribute::make(
            get: fn (string $value): string => strtolower($value),
        );
    }

    /**
     * Get the user's initials
     */
    public function initials(): string
    {
        $initials = Str::initials($this->name, true);

        return Str::length($initials) > 1
            ? Str::substr($initials, 0, 1).Str::substr($initials, -1)
            : $initials;
    }

    /**
     * Determine if the user's account status allows them to sign in.
     */
    public function isActive(): bool
    {
        return $this->status === UserStatus::Active;
    }
}
