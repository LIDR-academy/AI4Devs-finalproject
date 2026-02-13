package com.hexagonal.meditationbuilder.infrastructure.in.rest.controller;

import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.context.annotation.Configuration;

/**
 * Test configuration for @WebMvcTest slices.
 * Disables JPA/DataSource auto-configuration to allow controller tests to run
 * without database dependencies.
 */
@Configuration
@EnableAutoConfiguration(exclude = {
    DataSourceAutoConfiguration.class,
    HibernateJpaAutoConfiguration.class
})
public class WebMvcTestConfig {
}
