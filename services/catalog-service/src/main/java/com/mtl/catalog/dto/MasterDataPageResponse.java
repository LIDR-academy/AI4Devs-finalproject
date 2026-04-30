package com.mtl.catalog.dto;

import java.util.List;

/**
 * Listado paginado o sin paginar (campo {@code unpaged}) para maestros de catálogo.
 */
public record MasterDataPageResponse<T>(
    List<T> content,
    long totalElements,
    int totalPages,
    int page,
    int size,
    boolean unpaged,
    boolean first,
    boolean last) {

  public static <T> MasterDataPageResponse<T> of(
      List<T> content, long totalElements, int page, int size, boolean unpaged) {
    int totalPages =
        unpaged
            ? 1
            : (int) Math.ceil(totalElements / (double) Math.max(size, 1));
    boolean first = unpaged || page <= 0;
    boolean last = unpaged || page >= totalPages - 1 || totalPages == 0;
    return new MasterDataPageResponse<>(
        content, totalElements, totalPages, page, size, unpaged, first, last);
  }
}
