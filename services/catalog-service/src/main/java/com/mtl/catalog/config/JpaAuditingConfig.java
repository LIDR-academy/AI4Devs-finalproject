package com.mtl.catalog.config;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Optional;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.auditing.DateTimeProvider;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@Configuration
@EnableJpaAuditing(
    auditorAwareRef = "catalogUsuarioAppAuditorAware",
    dateTimeProviderRef = "catalogOffsetDateTimeProvider")
public class JpaAuditingConfig {

  @Bean(name = "catalogOffsetDateTimeProvider")
  DateTimeProvider catalogOffsetDateTimeProvider() {
    return () -> Optional.of(OffsetDateTime.now(ZoneOffset.UTC));
  }
}
