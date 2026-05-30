package com.mtl.media.config;

import jakarta.validation.constraints.NotNull;
import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "mtl.media.presign")
public class MediaPresignProperties {

  @NotNull private Duration expiresIn = Duration.ofMinutes(15);

  public Duration getExpiresIn() {
    return expiresIn;
  }

  public void setExpiresIn(Duration expiresIn) {
    this.expiresIn = expiresIn;
  }
}
