<?php

namespace App\Livewire\Settings;

use App\Actions\Users\RequestEmailChange;
use App\Concerns\ProfileValidationRules;
use Flux\Flux;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Livewire\Attributes\Computed;
use Livewire\Attributes\Title;
use Livewire\Component;

#[Title('Profile settings')]
class Profile extends Component
{
    use ProfileValidationRules;

    public string $name = '';

    public string $email = '';

    /**
     * Mount the component.
     *
     * `ConfirmEmailChangeController` flashes a translated `status` message
     * (either `users.email_change.confirmed` or `users.email_change.refused`)
     * and redirects back here — surface it as a toast, since every other
     * Settings component reports feedback that way rather than an inline
     * status banner.
     */
    public function mount(): void
    {
        $this->name = Auth::user()->name;
        $this->email = Auth::user()->email;

        $status = session('status');

        if ($status === __('users.email_change.confirmed')) {
            Flux::toast(variant: 'success', text: $status);
        } elseif ($status === __('users.email_change.refused')) {
            Flux::toast(variant: 'danger', text: $status);
        }
    }

    /**
     * Update the profile information for the currently authenticated user.
     *
     * A name change applies immediately. An email change never rewrites
     * `users.email` — it is routed through RequestEmailChange, which parks
     * the new address as `pending_email` and sends a verification link to
     * it; the change only lands once that link is used.
     */
    public function updateProfileInformation(RequestEmailChange $requestEmailChange): void
    {
        $user = Auth::user();

        // Normalise before validate() so the uniqueness rule sees the value
        // that will actually be persisted.
        $this->email = Str::lower($this->email);

        $validated = $this->validate($this->profileRules($user->id));

        $user->fill(['name' => $validated['name']])->save();

        // Only call the action when the submitted address genuinely differs
        // from what's stored: only the explicit Cancel action (see
        // cancelEmailChange()) should drop a pending change. Without this
        // guard, any later save that leaves the email field untouched (e.g.
        // a name-only edit) would resubmit the current stored address and
        // silently cancel an unrelated pending change via
        // RequestEmailChange's own "revert to current" branch.
        if (Str::lower($validated['email']) !== Str::lower((string) $user->getRawOriginal('email'))) {
            $requestEmailChange($user, $validated['email']);
        }

        // Resync from the stored column, not the (possibly still-pending)
        // submitted value: keeps the bound $email in lockstep with
        // users.email so an unrelated later save never resubmits a stale
        // pending address to RequestEmailChange.
        $this->email = $user->email;

        Flux::toast(variant: 'success', text: __('Profile updated.'));
    }

    /**
     * Cancel the currently authenticated user's pending email address
     * change, invalidating the outstanding verification link.
     */
    public function cancelEmailChange(): void
    {
        $user = Auth::user();

        $user->forceFill(['pending_email' => null])->save();

        $this->email = $user->email;
    }

    /**
     * Send an email verification notification to the current user.
     */
    public function resendVerificationNotification(): void
    {
        $user = Auth::user();

        if ($user->hasVerifiedEmail()) {
            $this->redirectIntended(default: route('dashboard', absolute: false));

            return;
        }

        $user->sendEmailVerificationNotification();

        Flux::toast(text: __('A new verification link has been sent to your email address.'));
    }

    /**
     * The currently authenticated user's pending email address, if any.
     */
    #[Computed]
    public function pendingEmail(): ?string
    {
        return Auth::user()->pending_email;
    }

    #[Computed]
    public function hasUnverifiedEmail(): bool
    {
        $user = Auth::user();

        return $user instanceof MustVerifyEmail && ! $user->hasVerifiedEmail();
    }

    #[Computed]
    public function showDeleteUser(): bool
    {
        $user = Auth::user();

        return ! $user instanceof MustVerifyEmail || $user->hasVerifiedEmail();
    }
}
