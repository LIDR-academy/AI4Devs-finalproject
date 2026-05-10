package com.mtl.catalog.dto;

import java.util.List;

public record PublicTreePageResponse(
    List<PublicTreeListItemDto> content,
    long totalResults,
    int page,
    int size,
    String sort) {}
