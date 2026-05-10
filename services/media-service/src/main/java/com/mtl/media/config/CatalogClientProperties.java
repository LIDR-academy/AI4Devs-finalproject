package com.mtl.media.config;

import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties(prefix = "mtl.catalog")
@Validated
public record CatalogClientProperties(@NotBlank String baseUrl) {}
