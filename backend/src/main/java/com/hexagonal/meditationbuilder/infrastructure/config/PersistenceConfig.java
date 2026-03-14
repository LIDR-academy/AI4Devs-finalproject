package com.hexagonal.meditationbuilder.infrastructure.config;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@EnableJpaRepositories(basePackages = "com.hexagonal")
@EntityScan(basePackages = "com.hexagonal")
public class PersistenceConfig {
}
