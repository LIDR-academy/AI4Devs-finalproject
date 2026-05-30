package com.mtl.media.dto;

import com.mtl.media.domain.CategoriaFotografia;

public record EjemplarPhotoGalleryItemResponse(
    Long id,
    String url,
    boolean isPrimary,
    int order,
    String mimeType,
    Integer width,
    Integer height,
    CategoriaFotografia category) {}
