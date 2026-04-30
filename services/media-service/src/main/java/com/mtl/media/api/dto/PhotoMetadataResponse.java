package com.mtl.media.api.dto;

import java.time.OffsetDateTime;

public record PhotoMetadataResponse(
    Long fotografiaId,
    Long arbolId,
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
