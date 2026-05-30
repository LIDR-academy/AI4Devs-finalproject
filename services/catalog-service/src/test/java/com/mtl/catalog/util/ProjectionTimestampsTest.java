package com.mtl.catalog.util;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.time.OffsetDateTime;
import org.junit.jupiter.api.Test;

class ProjectionTimestampsTest {

  @Test
  void toOffsetDateTime_convertsInstantAtUtc() {
    Instant instant = Instant.parse("2024-06-01T10:15:30Z");

    OffsetDateTime result = ProjectionTimestamps.toOffsetDateTime(instant);

    assertThat(result).isEqualTo(OffsetDateTime.parse("2024-06-01T10:15:30Z"));
  }

  @Test
  void toOffsetDateTime_nullReturnsNull() {
    assertThat(ProjectionTimestamps.toOffsetDateTime(null)).isNull();
  }
}
