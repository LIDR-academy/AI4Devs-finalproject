package com.mtl.media.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ConfirmPhotoUploadRequest(
    @NotNull Long ejemplarId,
    @NotBlank String bucket,
    @NotBlank String objectKey,
    @NotBlank String nombreFicheroOriginal,
    @NotBlank String tipoMime,
    @Min(1) long tamanoBytes,
    Integer anchoPx,
    Integer altoPx,
    Integer orden,
    Boolean esPrincipal,
    String checksumSha256) {}
