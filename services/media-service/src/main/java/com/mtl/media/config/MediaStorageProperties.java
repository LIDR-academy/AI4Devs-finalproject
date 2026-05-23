package com.mtl.media.config;

import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "mtl.media.storage")
public class MediaStorageProperties {

  @NotBlank private String bucket = "mtl-photos";
  @NotBlank private String endpoint = "http://localhost:9000";

  /**
   * Credenciales del almacén S3/MinIO. Configurar en perfil {@code dev} o variables de entorno
   * {@code MINIO_ROOT_USER} / {@code MINIO_ROOT_PASSWORD} (véase infra/compose/.env.example).
   */
  @NotBlank private String accessKey;

  @NotBlank private String secretKey;

  public String getBucket() {
    return bucket;
  }

  public void setBucket(String bucket) {
    this.bucket = bucket;
  }

  public String getEndpoint() {
    return endpoint;
  }

  public void setEndpoint(String endpoint) {
    this.endpoint = endpoint;
  }

  public String getAccessKey() {
    return accessKey;
  }

  public void setAccessKey(String accessKey) {
    this.accessKey = accessKey;
  }

  public String getSecretKey() {
    return secretKey;
  }

  public void setSecretKey(String secretKey) {
    this.secretKey = secretKey;
  }
}
