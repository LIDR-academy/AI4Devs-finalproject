package com.mtl.catalog.application;

import com.mtl.catalog.domain.EstadoPublicacion;
import com.mtl.catalog.domain.VisibilidadMapaPublico;
import com.mtl.catalog.exception.CatalogValidationException;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.EspecieRepository;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.ProvinciaReadRepository;
import java.math.BigDecimal;
import java.util.Locale;

/** Validaciones R1/R2 y normalización de campos de ficha de árbol compartidas por alta y edición. */
final class EjemplarCatalogRules {

  static final BigDecimal MIN_LAT = new BigDecimal("-90");
  static final BigDecimal MAX_LAT = new BigDecimal("90");
  static final BigDecimal MIN_LON = new BigDecimal("-180");
  static final BigDecimal MAX_LON = new BigDecimal("180");

  static final int MAX_MUNICIPIO = 255;
  static final int MAX_VISIBILIDAD = 64;
  static final int MAX_ESTADO_PUBLICACION = 64;

  private EjemplarCatalogRules() {}

  static void validateCoordinates(BigDecimal latitud, BigDecimal longitud) {
    if (latitud == null || longitud == null) {
      throw new CatalogValidationException("Se requieren latitud y longitud del ejemplar.");
    }
    if (latitud.compareTo(MIN_LAT) < 0 || latitud.compareTo(MAX_LAT) > 0) {
      throw new CatalogValidationException("La latitud debe estar entre -90 y 90.");
    }
    if (longitud.compareTo(MIN_LON) < 0 || longitud.compareTo(MAX_LON) > 0) {
      throw new CatalogValidationException("La longitud debe estar entre -180 y 180.");
    }
  }

  static void validateMasters(
      Long especieId,
      Long provinciaId,
      EspecieRepository especieRepository,
      ProvinciaReadRepository provinciaReadRepository) {
    if (especieId == null) {
      throw new CatalogValidationException("Se requiere especie_id.");
    }
    if (provinciaId == null) {
      throw new CatalogValidationException("Se requiere provincia_id.");
    }
    if (!especieRepository.existsById(especieId)) {
      throw new CatalogValidationException("La especie indicada no existe en el catálogo.");
    }
    if (!provinciaReadRepository.existsById(provinciaId)) {
      throw new CatalogValidationException("La provincia indicada no existe en el catálogo.");
    }
  }

  static VisibilidadMapaPublico validateAndNormalizeVisibility(String rawValue) {
    if (rawValue == null) {
      return null;
    }
    String normalized = rawValue.toUpperCase(Locale.ROOT);
    try {
      return VisibilidadMapaPublico.valueOf(normalized);
    } catch (IllegalArgumentException ex) {
      throw new CatalogValidationException("publicMapVisibility debe ser PRIVADO o PUBLICO.");
    }
  }

  static EstadoPublicacion validateAndNormalizePublicationState(String rawValue) {
    if (rawValue == null) {
      return null;
    }
    String normalized = rawValue.toUpperCase(Locale.ROOT);
    try {
      return EstadoPublicacion.valueOf(normalized);
    } catch (IllegalArgumentException ex) {
      throw new CatalogValidationException("publicationState debe ser BORRADOR o PUBLICADO.");
    }
  }

  static String blankToNull(String s) {
    if (s == null) {
      return null;
    }
    String t = s.trim();
    return t.isEmpty() ? null : t;
  }

  static String truncate(String s, int maxLen) {
    if (s == null) {
      return null;
    }
    return s.length() <= maxLen ? s : s.substring(0, maxLen);
  }
}
