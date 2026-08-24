<?php

namespace App\Exceptions;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use RuntimeException;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

/**
 * Thrown by App\Actions\Auth\EnsureRecentPasswordConfirmation (story 0015a)
 * when the acting user's password confirmation is stale or absent. Renders
 * as a 423 Locked — the exact status
 * Illuminate\Auth\Middleware\RequirePassword::handle() itself returns on its
 * own JSON branch for the identical condition, so this app's step-up
 * refusal converges on the status the framework already uses for it.
 *
 * Deliberately NOT an AuthorizationException / 403: a 403 is
 * indistinguishable from "you lack the permission", and the whole point of
 * this refusal is that the actor DOES hold the permission and is only
 * missing a recent proof of identity.
 */
class PasswordConfirmationRequiredException extends RuntimeException
{
    /**
     * Render the exception as an HTTP response.
     */
    public function render(Request $request): SymfonyResponse
    {
        if ($request->expectsJson()) {
            return new JsonResponse(['message' => $this->getMessage()], SymfonyResponse::HTTP_LOCKED);
        }

        return new Response($this->getMessage(), SymfonyResponse::HTTP_LOCKED);
    }
}
