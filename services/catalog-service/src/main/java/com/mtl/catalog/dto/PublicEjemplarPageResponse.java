package com.mtl.catalog.dto;

import java.util.List;

public record PublicEjemplarPageResponse(
    List<PublicEjemplarListItemDto> content,
    long totalResults,
    int page,
    int size,
    String sort) {}
