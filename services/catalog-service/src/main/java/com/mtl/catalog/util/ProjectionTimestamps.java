package com.mtl.catalog.util;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

/** Conversión explícita para proyecciones JPA (TIMESTAMPTZ → {@link Instant} en runtime). */
public final class ProjectionTimestamps {

  private ProjectionTimestamps() {}

  public static OffsetDateTime toOffsetDateTime(Instant instant) {
    return instant == null ? null : OffsetDateTime.ofInstant(instant, ZoneOffset.UTC);
  }
}
