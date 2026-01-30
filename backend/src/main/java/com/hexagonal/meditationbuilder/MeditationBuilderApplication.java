package com.hexagonal.meditationbuilder;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

/**
 * Main entry point for the Meditation Builder application.
 * 
 * <p>Meditation Builder is a content composition platform that allows
 * users to create meditation content with AI-assisted text and image
 * generation, combined with background music from a media catalog.</p>
 * 
 * <p>Architecture: Hexagonal (Ports and Adapters)</p>
 * <ul>
 *   <li>Domain: Business logic and domain models</li>
 *   <li>Application: Use case orchestration</li>
 *   <li>Infrastructure: External adapters (REST APIs, AI services)</li>
 * </ul>
 * 
 * @see com.hexagonal.meditationbuilder.infrastructure.config.InfrastructureConfig
 */
@SpringBootApplication
@ConfigurationPropertiesScan("com.hexagonal.meditationbuilder.infrastructure.config")
public class MeditationBuilderApplication {

    public static void main(String[] args) {
        SpringApplication.run(MeditationBuilderApplication.class, args);
    }
}
