package com.mtl.notification.dto;

import java.util.List;
import org.springframework.data.domain.Page;

/** Paginación alineada con maestros de catálogo / OpenAPI `NotificationSubscriptionAdminPage`. */
public record SubscriptionAdminPageResponse(
    List<SubscriptionAdminItemResponse> content,
    long totalElements,
    int totalPages,
    int page,
    int size,
    boolean unpaged,
    boolean first,
    boolean last) {

  public static SubscriptionAdminPageResponse fromPage(Page<SubscriptionAdminItemResponse> result) {
    return new SubscriptionAdminPageResponse(
        result.getContent(),
        result.getTotalElements(),
        result.getTotalPages(),
        result.getNumber(),
        result.getSize(),
        false,
        result.isFirst(),
        result.isLast());
  }
}
