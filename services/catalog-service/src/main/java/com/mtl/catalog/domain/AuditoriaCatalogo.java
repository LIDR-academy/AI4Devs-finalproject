package com.mtl.catalog.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "auditoria_catalogo", schema = "catalog")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class AuditoriaCatalogo {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @EqualsAndHashCode.Include
  @Column(name = "auditoria_id")
  private Long id;

  @Column(name = "actor_usuario_app_id", nullable = false)
  private Long actorUsuarioAppId;

  @Column(name = "operacion", nullable = false, length = 128)
  private String operacion;

  @Column(name = "ocurrido_en", nullable = false)
  private OffsetDateTime ocurridoEn;

  @Column(name = "datos_previos_resumen", columnDefinition = "TEXT")
  private String datosPreviosResumen;

  @Column(name = "datos_nuevos_resumen", columnDefinition = "TEXT")
  private String datosNuevosResumen;
}
