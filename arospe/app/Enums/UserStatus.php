<?php

namespace App\Enums;

enum UserStatus: string
{
    case Active = 'active';
    case Inactive = 'inactive';
    case Suspended = 'suspended';

    /**
     * Get the translated, human-readable label for the status.
     */
    public function label(): string
    {
        return __('users.statuses.'.$this->value);
    }
}
