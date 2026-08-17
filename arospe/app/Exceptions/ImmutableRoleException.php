<?php

namespace App\Exceptions;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use RuntimeException;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

/**
 * Thrown by `App\Models\Role`'s deletion/edit/permission-mutation guards
 * when the Super Admin role is the target — a categorical refusal reached
 * by code paths that never call `Gate`/`authorize()` (see
 * `App\Policies\RolePolicy` for the layer that does). Renders as a 403,
 * converging on the same status a policy denial produces.
 */
class ImmutableRoleException extends RuntimeException
{
    /**
     * Render the exception as an HTTP response.
     */
    public function render(Request $request): SymfonyResponse
    {
        if ($request->expectsJson()) {
            return new JsonResponse(['message' => $this->getMessage()], SymfonyResponse::HTTP_FORBIDDEN);
        }

        return new Response($this->getMessage(), SymfonyResponse::HTTP_FORBIDDEN);
    }
}
