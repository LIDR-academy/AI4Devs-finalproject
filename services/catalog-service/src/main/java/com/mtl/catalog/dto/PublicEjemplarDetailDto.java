package com.mtl.catalog.dto;

import java.math.BigDecimal;

public record PublicEjemplarDetailDto(
    Long ejemplarId,
    String nombreComun,
    String nombreCientifico,
    String provincia,
    String municipio,
    String estado,
    String visibilidad,
    String descripcion,
    BigDecimal latitud,
    BigDecimal longitud,
    Integer altura) {}
