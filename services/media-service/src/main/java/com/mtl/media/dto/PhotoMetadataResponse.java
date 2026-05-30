package com.mtl.media.dto;

import java.time.OffsetDateTime;

public record PhotoMetadataResponse(
    Long photoId,
    Long ejemplarId,
    String bucket,
    String objectKey,
    String nombreFicheroOriginal,
    String tipoMime,
    long tamanoBytes,
    Integer anchoPx,
    Integer altoPx,
    int orden,
    boolean esPrincipal,
    OffsetDateTime subidaEn) {}
