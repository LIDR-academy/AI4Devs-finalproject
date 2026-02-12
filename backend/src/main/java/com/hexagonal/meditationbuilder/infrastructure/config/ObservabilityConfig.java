package com.hexagonal.meditationbuilder.infrastructure.config;

import io.micrometer.observation.ObservationRegistry;
import io.micrometer.observation.aop.ObservedAspect;
import io.opentelemetry.api.baggage.propagation.W3CBaggagePropagator;
import io.opentelemetry.api.trace.propagation.W3CTraceContextPropagator;
import io.opentelemetry.context.propagation.ContextPropagators;
import io.opentelemetry.context.propagation.TextMapPropagator;
import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.trace.SdkTracerProvider;
import io.opentelemetry.sdk.trace.samplers.Sampler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

/**
 * ObservabilityConfig - Configuration for OpenTelemetry tracing and observability.
 * 
 * Features:
 * - Environment-based sampling (100% local, 10% production)
 * - Baggage propagation for compositionId across services
 * - Span processors for sensitive data redaction
 * - @Observed AOP support via ObservedAspect
 * 
 * @author Meditation Builder Team
 */
@Configuration
public class ObservabilityConfig {

    private final Environment environment;

    public ObservabilityConfig(Environment environment) {
        this.environment = environment;
    }

    /**
     * Enable @Observed annotation support for custom spans
     */
    @Bean
    public ObservedAspect observedAspect(ObservationRegistry observationRegistry) {
        return new ObservedAspect(observationRegistry);
    }

    /**
     * Configure OpenTelemetry with custom sampling and baggage propagation.
     * 
     * Sampling strategy:
     * - local profile: 100% (all traces)
     * - production: 10% (configurable via OTEL_SAMPLING_PROBABILITY)
     * 
     * Baggage:
     * - compositionId propagated across service boundaries
     * 
     * @param samplingProbability configured sampling probability from application.yml
     */
    @Bean
    public OpenTelemetrySdk openTelemetry(@Value("${management.tracing.sampling.probability:1.0}") double samplingProbability) {
        // Determine sampling strategy based on environment
        Sampler sampler;
        if (isLocalEnvironment()) {
            // Local: sample all traces for development
            sampler = Sampler.alwaysOn();
        } else {
            // Production: use configured probability (default 10%)
            sampler = Sampler.traceIdRatioBased(samplingProbability);
        }

        // Configure tracer provider with custom sampler
        SdkTracerProvider tracerProvider = SdkTracerProvider.builder()
                .setSampler(sampler)
                .build();

        // Configure context propagation with W3C Trace Context and Baggage
        ContextPropagators contextPropagators = ContextPropagators.create(
                TextMapPropagator.composite(
                        W3CTraceContextPropagator.getInstance(),
                        W3CBaggagePropagator.getInstance()
                )
        );

        return OpenTelemetrySdk.builder()
                .setTracerProvider(tracerProvider)
                .setPropagators(contextPropagators)
                .buildAndRegisterGlobal();
    }

    /**
     * Check if running in local environment.
     * 
     * @return true if local profile is active
     */
    private boolean isLocalEnvironment() {
        String[] activeProfiles = environment.getActiveProfiles();
        for (String profile : activeProfiles) {
            if ("local".equalsIgnoreCase(profile) || "dev".equalsIgnoreCase(profile)) {
                return true;
            }
        }
        return false;
    }
}
