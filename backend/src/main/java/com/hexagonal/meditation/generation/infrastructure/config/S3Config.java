package com.hexagonal.meditation.generation.infrastructure.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;

import java.net.URI;

/**
 * AWS S3 client configuration.
 * Supports both AWS S3 (production) and LocalStack (local development).
 */
@Configuration
public class S3Config {

    @Value("${aws.s3.endpoint:}")
    private String endpoint;

    @Value("${aws.region:us-east-1}")
    private String region;

    @Value("${aws.credentials.access-key:}")
    private String accessKeyId;

    @Value("${aws.credentials.secret-key:}")
    private String secretAccessKey;

    @Bean
    public S3Client s3Client() {
        var builder = S3Client.builder()
                .region(Region.of(region));

        // Configure credentials if provided
        if (!accessKeyId.isBlank() && !secretAccessKey.isBlank()) {
            builder.credentialsProvider(
                    StaticCredentialsProvider.create(
                            AwsBasicCredentials.create(accessKeyId, secretAccessKey)
                    )
            );
        }

        // Configure endpoint for LocalStack
        if (!endpoint.isBlank()) {
            builder.endpointOverride(URI.create(endpoint))
                    .serviceConfiguration(
                            S3Configuration.builder()
                                    .pathStyleAccessEnabled(true)  // Required for LocalStack
                                    .build()
                    );
        }

        return builder.build();
    }
}
