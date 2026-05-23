package com.mtl.catalog.application;

import com.mtl.catalog.domain.AuditoriaCatalogo;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.AuditoriaCatalogoRepository;
import java.time.Instant;
import org.springframework.stereotype.Service;

@Service
public class CatalogAuditService {

  public static final String OPERACION_ARBOL_CREADO = "ARBOL_CREADO";
  public static final String OPERACION_ARBOL_MODIFICADO = "ARBOL_MODIFICADO";
  public static final String OPERACION_ARBOL_ELIMINADO = "ARBOL_ELIMINADO";
  public static final String OPERACION_FAMILIA_CREADA = "FAMILIA_CREADA";
  public static final String OPERACION_GENERO_CREADO = "GENERO_CREADO";
  public static final String OPERACION_ESPECIE_CREADA = "ESPECIE_CREADA";
  public static final String OPERACION_ESPECIE_MODIFICADA = "ESPECIE_MODIFICADA";
  public static final String OPERACION_ESPECIE_ELIMINADA = "ESPECIE_ELIMINADA";

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

  /** Resumen sin PII: ids técnicos antes y después de la modificación (R3). */
  public void recordTreeModified(
      long actorUsuarioAppId,
      long arbolId,
      long especieIdPrev,
      long provinciaIdPrev,
      long especieIdNew,
      long provinciaIdNew) {
    AuditoriaCatalogo row = new AuditoriaCatalogo();
    row.setActorUsuarioAppId(actorUsuarioAppId);
    row.setOperacion(OPERACION_ARBOL_MODIFICADO);
    row.setOcurridoEn(Instant.now());
    row.setDatosPreviosResumen(
        "arbol_id=%d especie_id=%d provincia_id=%d".formatted(arbolId, especieIdPrev, provinciaIdPrev));
    row.setDatosNuevosResumen(
        "arbol_id=%d especie_id=%d provincia_id=%d".formatted(arbolId, especieIdNew, provinciaIdNew));
    auditoriaCatalogoRepository.save(row);
  }

  /** Resumen sin PII: ids técnicos de la ficha eliminada (R3). */
  public void recordTreeDeleted(
      long actorUsuarioAppId, long arbolId, long especieId, long provinciaId) {
    AuditoriaCatalogo row = new AuditoriaCatalogo();
    row.setActorUsuarioAppId(actorUsuarioAppId);
    row.setOperacion(OPERACION_ARBOL_ELIMINADO);
    row.setOcurridoEn(Instant.now());
    row.setDatosPreviosResumen(
        "arbol_id=%d especie_id=%d provincia_id=%d".formatted(arbolId, especieId, provinciaId));
    row.setDatosNuevosResumen(null);
    auditoriaCatalogoRepository.save(row);
  }

  public void recordFamilyCreated(long actorUsuarioAppId, String resumen) {
    AuditoriaCatalogo row = new AuditoriaCatalogo();
    row.setActorUsuarioAppId(actorUsuarioAppId);
    row.setOperacion(OPERACION_FAMILIA_CREADA);
    row.setOcurridoEn(Instant.now());
    row.setDatosPreviosResumen(null);
    row.setDatosNuevosResumen(resumen);
    auditoriaCatalogoRepository.save(row);
  }

  public void recordGenusCreated(long actorUsuarioAppId, String resumen) {
    AuditoriaCatalogo row = new AuditoriaCatalogo();
    row.setActorUsuarioAppId(actorUsuarioAppId);
    row.setOperacion(OPERACION_GENERO_CREADO);
    row.setOcurridoEn(Instant.now());
    row.setDatosPreviosResumen(null);
    row.setDatosNuevosResumen(resumen);
    auditoriaCatalogoRepository.save(row);
  }

  public void recordSpeciesCreated(long actorUsuarioAppId, String resumen) {
    AuditoriaCatalogo row = new AuditoriaCatalogo();
    row.setActorUsuarioAppId(actorUsuarioAppId);
    row.setOperacion(OPERACION_ESPECIE_CREADA);
    row.setOcurridoEn(Instant.now());
    row.setDatosPreviosResumen(null);
    row.setDatosNuevosResumen(resumen);
    auditoriaCatalogoRepository.save(row);
  }

  public void recordSpeciesModified(
      long actorUsuarioAppId, String resumenPrevio, String resumenNuevo) {
    AuditoriaCatalogo row = new AuditoriaCatalogo();
    row.setActorUsuarioAppId(actorUsuarioAppId);
    row.setOperacion(OPERACION_ESPECIE_MODIFICADA);
    row.setOcurridoEn(Instant.now());
    row.setDatosPreviosResumen(resumenPrevio);
    row.setDatosNuevosResumen(resumenNuevo);
    auditoriaCatalogoRepository.save(row);
  }

  public void recordSpeciesDeleted(long actorUsuarioAppId, String resumen) {
    AuditoriaCatalogo row = new AuditoriaCatalogo();
    row.setActorUsuarioAppId(actorUsuarioAppId);
    row.setOperacion(OPERACION_ESPECIE_ELIMINADA);
    row.setOcurridoEn(Instant.now());
    row.setDatosPreviosResumen(resumen);
    row.setDatosNuevosResumen(null);
    auditoriaCatalogoRepository.save(row);
  }
}
