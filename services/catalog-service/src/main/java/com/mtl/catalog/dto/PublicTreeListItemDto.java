package com.mtl.catalog.dto;

public record PublicTreeListItemDto(
    Long treeId,
    String nombreComun,
    String nombreCientifico,
    String provincia,
    String municipio,
    String estado,
    String visibilidad) {}
