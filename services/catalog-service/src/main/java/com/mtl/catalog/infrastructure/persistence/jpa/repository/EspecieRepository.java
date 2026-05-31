package com.mtl.catalog.infrastructure.persistence.jpa.repository;

import com.mtl.catalog.domain.Especie;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Acceso JPA estándar a {@link Especie} (altas, bajas y lecturas por id).
 *
 * <p>Las consultas de listado con búsqueda nativa ({@code unaccent}, {@code strpos}) viven en
 * {@link EspecieReadRepository}.
 */
public interface EspecieRepository extends JpaRepository<Especie, Long> {

  /** Tope de filas cuando la API pide listado sin paginar (protección frente a respuestas enormes). */
  int MAX_UNPAGED = 10_000;
}
