package com.mtl.media.config;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import java.util.LinkedHashSet;
import java.util.Set;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.convert.DataSizeUnit;
import org.springframework.validation.annotation.Validated;
import org.springframework.util.unit.DataSize;
import org.springframework.util.unit.DataUnit;

@Validated
@ConfigurationProperties(prefix = "mtl.media.upload")
public class MediaUploadProperties {

  @DataSizeUnit(DataUnit.MEGABYTES)
  private DataSize maxFileSize = DataSize.ofMegabytes(20);

  @Min(1)
  private int maxPhotosPerTree = 10;

  @NotEmpty
  private Set<String> allowedMimeTypes =
      new LinkedHashSet<>(Set.of("image/jpeg", "image/png", "image/webp"));

  public DataSize getMaxFileSize() {
    return maxFileSize;
  }

  public void setMaxFileSize(DataSize maxFileSize) {
    this.maxFileSize = maxFileSize;
  }

  public int getMaxPhotosPerTree() {
    return maxPhotosPerTree;
  }

  public void setMaxPhotosPerTree(int maxPhotosPerTree) {
    this.maxPhotosPerTree = maxPhotosPerTree;
  }

  public Set<String> getAllowedMimeTypes() {
    return allowedMimeTypes;
  }

  public void setAllowedMimeTypes(Set<String> allowedMimeTypes) {
    this.allowedMimeTypes = allowedMimeTypes;
  }
}
