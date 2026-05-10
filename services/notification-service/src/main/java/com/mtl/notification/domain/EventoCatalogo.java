package com.mtl.notification.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "evento_catalogo", schema = "notification")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class EventoCatalogo {

  @Id
  @EqualsAndHashCode.Include
  @Column(name = "evento_id")
  private Long eventoId;

  @Column(name = "tipo_evento", nullable = false, length = 64)
  private String tipoEvento;

  @Column(name = "arbol_id", nullable = false)
  private Long arbolId;

  @Column(name = "carga_evento_json", columnDefinition = "text")
  private String cargaEventoJson;

  @Column(name = "estado_procesamiento", nullable = false, length = 32)
  private String estadoProcesamiento;

  @Column(name = "recibido_en", nullable = false)
  private Instant recibidoEn;

  @Column(name = "procesado_en")
  private Instant procesadoEn;
}
