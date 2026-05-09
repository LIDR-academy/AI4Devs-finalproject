package com.mtl.media.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PresignUploadRequest(
    @NotNull Long arbolId,
    @NotBlank String nombreFicheroOriginal,
    @NotBlank String tipoMime,
    @Min(1) long tamanoBytes) {}
