package com.mtl.media.dto;

import com.mtl.media.domain.CategoriaFotografia;

public record EjemplarPhotoGalleryItemResponse(
    Long id,
    String url,
    boolean esPrincipal,
    int orden,
    String mimeType,
    Integer ancho,
    Integer alto,
    CategoriaFotografia categoria) {}
