package com.mtl.catalog.application;

import com.mtl.catalog.domain.AuditoriaCatalogo;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.AuditoriaCatalogoRepository;
import java.time.Instant;
import org.springframework.stereotype.Service;

@Service
public class CatalogAuditService {

  public static final String OPERACION_ARBOL_CREADO = "ARBOL_CREADO";

  private final AuditoriaCatalogoRepository auditoriaCatalogoRepository;

  public CatalogAuditService(AuditoriaCatalogoRepository auditoriaCatalogoRepository) {
    this.auditoriaCatalogoRepository = auditoriaCatalogoRepository;
  }

  /** Resumen sin PII: solo identificadores técnicos (R3). */
  public void recordTreeCreated(
      long actorUsuarioAppId, long arbolId, long especieId, long provinciaId) {
    AuditoriaCatalogo row = new AuditoriaCatalogo();
    row.setActorUsuarioAppId(actorUsuarioAppId);
    row.setOperacion(OPERACION_ARBOL_CREADO);
    row.setOcurridoEn(Instant.now());
    row.setDatosPreviosResumen(null);
    row.setDatosNuevosResumen(
        "arbol_id=%d especie_id=%d provincia_id=%d".formatted(arbolId, especieId, provinciaId));
    auditoriaCatalogoRepository.save(row);
  }
}
