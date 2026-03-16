package com.hexagonal.meditation.generation.infrastructure.out.adapter.storage;

import com.hexagonal.meditation.generation.domain.ports.out.MediaStoragePort.MediaFileType;
import com.hexagonal.meditation.generation.domain.ports.out.MediaStoragePort.UploadRequest;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.testcontainers.containers.localstack.LocalStackContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.testcontainers.containers.localstack.LocalStackContainer.Service.S3;

@Testcontainers
@DisplayName("S3MediaStorageAdapter Integration Tests")
class S3MediaStorageAdapterIntegrationTest {

    @Container
    static LocalStackContainer localstack = new LocalStackContainer(DockerImageName.parse("localstack/localstack:latest"))
            .withServices(S3);

    private S3MediaStorageAdapter adapter;
    private S3Client s3Client;

    @TempDir
    Path tempDir;

    @BeforeAll
    static void startLocalStack() throws IOException, InterruptedException {
        localstack.execInContainer("awslocal", "s3", "mb", "s3://meditation-media");
    }

    @BeforeEach
    void setUp() {
        s3Client = S3Client.builder()
                .endpointOverride(localstack.getEndpointOverride(S3))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(localstack.getAccessKey(), localstack.getSecretKey())))
                .region(Region.of(localstack.getRegion()))
                .build();

        adapter = new S3MediaStorageAdapter(s3Client, localstack.getEndpointOverride(S3).toString(), "meditation-media");
    }

    @Test
    @DisplayName("Should upload real file to LocalStack S3 and verify it exists")
    void shouldUploadToRealS3() throws IOException {
        Path localFile = tempDir.resolve("e2e-video.mp4");
        Files.writeString(localFile, "real video content simulation");

        String userId = UUID.randomUUID().toString();
        UUID meditationId = UUID.randomUUID();

        UploadRequest request = new UploadRequest(
                localFile,
                userId,
                meditationId,
                MediaFileType.VIDEO,
                3600L
        );

        String url = adapter.uploadMedia(request);

        assertThat(url).isNotNull();
        assertThat(url).contains("meditation-media");

        // Verify with S3Client
        String key = "generation/" + userId + "/" + meditationId + "/video.mp4";
        HeadObjectRequest headRequest = HeadObjectRequest.builder()
                .bucket("meditation-media")
                .key(key)
                .build();

        assertThat(s3Client.headObject(headRequest)).isNotNull();
    }
}
