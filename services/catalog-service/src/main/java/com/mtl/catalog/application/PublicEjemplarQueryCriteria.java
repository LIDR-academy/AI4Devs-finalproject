package com.mtl.catalog.application;

/**
 * Criterios internos para consultas públicas de ejemplar. Nombres alineados a dominio/SQL ({@code
 * especie}, {@code estado_publicacion}, …), no al wire HTTP.
 */
public record PublicEjemplarQueryCriteria(
    String especieContains,
    String provinciaContains,
    String municipioContains,
    String estadoPublicacion,
    String visibilidadMapa,
    String sortFieldPersistence,
    String sortDirection,
    String sortFieldApi) {}
