<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * Thrown by a MultiSelectOptionsResolver::resolveSelected() implementation when it cannot
 * vouch for every requested id. Deliberately has NO render() method — unlike its sibling
 * App\Exceptions\ImmutableRoleException, this must never reach the HTTP layer as a status
 * code. It is a value carrier for a caller that is expected to catch it and translate it
 * into a field-level validation error (story 0022, decision D12).
 */
class UnresolvedSelectionException extends RuntimeException
{
    /** @param  array<int, string>  $missingIds */
    public function __construct(public readonly array $missingIds)
    {
        parent::__construct('Unresolvable selection: '.implode(', ', $missingIds));
    }
}
