package com.mtl.media.api.dto;

import com.mtl.media.domain.CategoriaFotografia;

public record TreePhotoGalleryItemResponse(
    Long id,
    String url,
    boolean esPrincipal,
    int orden,
    String mimeType,
    Integer ancho,
    Integer alto,
    CategoriaFotografia categoria) {}
