<?php

namespace App\Enums;

/**
 * A geography catalog entry's level of granularity.
 *
 * Exactly three levels, in a strict two-hop tree: `Country` rows have no
 * parent, `Community` rows parent to a `Country` (today, always "España"),
 * and `Municipality` rows parent to a `Community`. `App\Models\GeographyEntry`
 * carries no invariant guard enforcing this shape at write time -- the
 * seeder is the sole writer, and it is the shape it always produces.
 *
 * `label()` added by story 0034 (the shipping zone geography picker, D-4):
 * this is the first real rendering site, so naming.md's "add label() when a
 * second consumer appears" deferral (recorded above when this enum shipped
 * with no label() at all) is discharged here rather than reopened. Reads
 * from lang/<locale>/geography.php, mirroring UserStatus::label().
 */
enum GeographyLevel: string
{
    case Country = 'country';
    case Community = 'community';
    case Municipality = 'municipality';

    public function label(): string
    {
        return __('geography.levels.'.$this->value);
    }
}
