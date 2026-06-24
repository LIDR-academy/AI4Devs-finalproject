package com.stayhub.infrastructure.config

import org.springframework.context.annotation.Configuration
import org.springframework.scheduling.annotation.EnableScheduling

/**
 * Activates Spring's `@Scheduled` task executor.
 *
 * Lives in the infrastructure layer so that scheduled components (e.g.
 * [com.stayhub.infrastructure.persistence.HoldCleanupScheduler]) can
 * pick up the annotation without polluting the application or domain layers.
 */
@Configuration
@EnableScheduling
class SchedulingConfig
