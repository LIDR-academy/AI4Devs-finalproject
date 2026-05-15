package com.mtl.catalog.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@Configuration
@EnableJpaAuditing(auditorAwareRef = "catalogUsuarioAppAuditorAware")
public class JpaAuditingConfig {}
