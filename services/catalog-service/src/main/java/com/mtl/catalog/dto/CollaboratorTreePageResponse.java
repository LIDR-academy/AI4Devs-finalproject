package com.mtl.catalog.dto;

import java.util.List;

public record CollaboratorTreePageResponse(
    List<CollaboratorTreeListItemDto> content,
    long totalResults,
    int page,
    int size,
    String sort) {}
