package com.mtl.catalog.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.OffsetDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.data.auditing.DateTimeProvider;

class JpaAuditingConfigTest {

  @Test
  void catalogOffsetDateTimeProvider_returnsUtcOffsetDateTime() {
    JpaAuditingConfig config = new JpaAuditingConfig();
    DateTimeProvider provider = config.catalogOffsetDateTimeProvider();

    assertThat(provider.getNow())
        .isPresent()
        .get()
        .isInstanceOf(OffsetDateTime.class)
        .extracting(o -> ((OffsetDateTime) o).getOffset())
        .isEqualTo(OffsetDateTime.now().withOffsetSameInstant(java.time.ZoneOffset.UTC).getOffset());
  }
}
