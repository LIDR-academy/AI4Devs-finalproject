package com.stayhub.domain.booking

/**
 * Filter for "My Trips". UPCOMING/PAST split is by check-out date (a mid-stay
 * trip still counts as upcoming); CANCELLED is purely status-based; ALL is
 * unfiltered. The reference date ("today") is supplied by the caller so the
 * boundary is testable and the clock stays in the application layer.
 */
enum class TripCategory {
    ALL,
    UPCOMING,
    PAST,
    CANCELLED,
}
