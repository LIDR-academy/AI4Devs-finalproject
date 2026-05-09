package com.mtl.catalog.infrastructure.persistence.jpa.repository.imp;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

/** Reserva el siguiente {@code evento_id} para mensajes Kafka (secuencia PostgreSQL, sin tabla). */
@Repository
public class CatalogArbolEventoIdSequence {

  @PersistenceContext
  private EntityManager entityManager;

  public long next() {
    Object row =
        entityManager
            .createNativeQuery("SELECT nextval('catalog.seq_arbol_evento_id')")
            .getSingleResult();
    if (!(row instanceof Number n)) {
      throw new IllegalStateException("nextval devolvió un tipo inesperado: " + row);
    }
    return n.longValue();
  }
}
