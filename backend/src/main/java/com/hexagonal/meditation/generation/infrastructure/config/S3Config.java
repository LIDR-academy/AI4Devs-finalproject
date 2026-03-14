package com.hexagonal.meditation.generation.infrastructure.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.NoSuchBucketException;

import java.net.URI;

/**
 * AWS S3 client configuration.
 * Supports both AWS S3 (production) and LocalStack (local development).
 * When a local endpoint is configured, an {@link ApplicationRunner} ensures
 * the bucket exists on every startup, so LocalStack restarts are self-healing.
 */
@Configuration
public class S3Config {

    private static final Logger logger = LoggerFactory.getLogger(S3Config.class);

    @Value("${aws.s3.endpoint:}")
    private String endpoint;

    @Value("${aws.region:us-east-1}")
    private String region;

    @Value("${aws.credentials.access-key:}")
    private String accessKeyId;

    @Value("${aws.credentials.secret-key:}")
    private String secretAccessKey;

    @Value("${aws.s3.bucket-name:meditation-outputs}")
    private String bucketName;

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

    /**
     * Ensures the configured S3 bucket exists when running against a local endpoint
     * (LocalStack). This is a no-op in production where the bucket is managed via IaC.
     */
    @Bean
    ApplicationRunner ensureBucketExists(S3Client s3Client) {
        return args -> {
            if (endpoint.isBlank()) {
                // Production: bucket must already exist — skip auto-creation
                return;
            }
            try {
                s3Client.headBucket(HeadBucketRequest.builder().bucket(bucketName).build());
                logger.info("S3 bucket '{}' already exists (LocalStack)", bucketName);
            } catch (NoSuchBucketException e) {
                logger.warn("S3 bucket '{}' not found — creating it in LocalStack", bucketName);
                s3Client.createBucket(CreateBucketRequest.builder().bucket(bucketName).build());
                logger.info("S3 bucket '{}' created successfully", bucketName);
            } catch (Exception e) {
                logger.warn("Could not verify/create S3 bucket '{}': {}", bucketName, e.getMessage());
            }
        };
    }
}
