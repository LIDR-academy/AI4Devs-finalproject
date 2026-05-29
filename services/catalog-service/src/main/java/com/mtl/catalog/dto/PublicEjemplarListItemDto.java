package com.mtl.catalog.dto;

public record PublicEjemplarListItemDto(
    Long ejemplarId,
    String nombreComun,
    String nombreCientifico,
    String provincia,
    String municipio,
    String estado,
    String visibilidad) {}
