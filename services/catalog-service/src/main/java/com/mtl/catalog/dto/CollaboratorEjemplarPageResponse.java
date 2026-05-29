package com.mtl.catalog.dto;

import java.util.List;

public record CollaboratorEjemplarPageResponse(
    List<CollaboratorEjemplarListItemDto> content,
    long totalResults,
    int page,
    int size,
    String sort) {}
