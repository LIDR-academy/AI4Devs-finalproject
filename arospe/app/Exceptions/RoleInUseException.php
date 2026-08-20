<?php

namespace App\Exceptions;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use RuntimeException;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

/**
 * Thrown by `App\Models\Role`'s `deleting` guard when the target role still
 * has holders — the model-event layer behind
 * `App\Livewire\Roles\Index::deleteRole()`'s own holder-count check
 * (defense in depth: a direct `$role->delete()` bypassing the component is
 * refused here too). Renders as a 409, since the request is well-formed and
 * the actor is authorized — the role simply cannot be deleted while it is
 * still referenced.
 */
class RoleInUseException extends RuntimeException
{
    /**
     * Render the exception as an HTTP response.
     */
    public function render(Request $request): SymfonyResponse
    {
        if ($request->expectsJson()) {
            return new JsonResponse(['message' => $this->getMessage()], SymfonyResponse::HTTP_CONFLICT);
        }

        return new Response($this->getMessage(), SymfonyResponse::HTTP_CONFLICT);
    }
}
