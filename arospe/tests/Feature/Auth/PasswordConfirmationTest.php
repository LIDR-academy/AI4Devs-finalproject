<?php

use App\Models\User;

test('confirm password screen can be rendered', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('password.confirm'));

    $response->assertOk();
});

// Story 0015a, Phase 4 finding F3 (decision D8): Laravel\Fortify\routes\routes.php registers
// password.confirm.store with no throttle at all -- unlike login/two-factor/passkeys, it never
// consults config('fortify.limiters.*'). App\Providers\FortifyServiceProvider appends
// throttle:confirm-password to the already-registered route object directly, keyed the same way
// Fortify's own login limiter is (by user id when authenticated, falling back to IP -- and every
// caller of this route is authenticated, since it sits behind the `auth` middleware).
test('repeated incorrect password submissions against the confirmation screen are rate limited at the 6th attempt', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    for ($attempt = 0; $attempt < 5; $attempt++) {
        $this->post(route('password.confirm.store'), ['password' => 'not-the-real-password']);
    }

    $response = $this->post(route('password.confirm.store'), ['password' => 'not-the-real-password']);

    $response->assertStatus(429);

    // The session key a genuine confirmation would have written is still absent -- the 6th
    // attempt was rejected by the limiter, never checked against the actual password.
    expect(session('auth.password_confirmed_at'))->toBeNull();
});
