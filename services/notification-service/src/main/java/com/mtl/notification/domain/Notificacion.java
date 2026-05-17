package com.mtl.notification.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "notificacion", schema = "notification")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Notificacion {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @EqualsAndHashCode.Include
  @Column(name = "notificacion_id")
  private Long notificacionId;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "evento_id", nullable = false)
  private EventoCatalogo eventoCatalogo;

  @Column(name = "arbol_id", nullable = false)
  private Long arbolId;

  @Column(name = "tipo_evento_catalogo", nullable = false, length = 64)
  private String tipoEventoCatalogo;

  @Column(name = "estado_generacion", nullable = false, length = 32)
  private String estadoGeneracion;

  @Column(name = "generada_en", nullable = false)
  private Instant generadaEn;
}
