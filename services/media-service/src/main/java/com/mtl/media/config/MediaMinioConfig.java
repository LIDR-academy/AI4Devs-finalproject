package com.mtl.media.config;

import com.mtl.media.storage.MinioObjectStoragePresigner;
import com.mtl.media.storage.ObjectStoragePresigner;
import io.minio.MinioClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MediaMinioConfig {

  @Bean
  public MinioClient mediaMinioClient(MediaStorageProperties properties) {
    return MinioClient.builder()
        .endpoint(properties.getEndpoint())
        .credentials(properties.getAccessKey(), properties.getSecretKey())
        .build();
  }

  @Bean
  public ObjectStoragePresigner objectStoragePresigner(MinioClient mediaMinioClient) {
    return new MinioObjectStoragePresigner(mediaMinioClient);
  }
}
