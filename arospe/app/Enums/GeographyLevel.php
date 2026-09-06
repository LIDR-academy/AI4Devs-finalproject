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
 * Deliberately no `label()` here, unlike `UserStatus`: this story ships no
 * screen and no rendering site at all, and per naming.md's rule a `label()`
 * is added when a second consumer appears -- here there is not yet a first
 * one. Add it (reading from a new lang/<locale>/geography.php) when story
 * 0033/0034's picker actually renders a level.
 */
enum GeographyLevel: string
{
    case Country = 'country';
    case Community = 'community';
    case Municipality = 'municipality';
}
