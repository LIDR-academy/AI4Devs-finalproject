package com.mtl.catalog.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "arbol", schema = "catalog")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Arbol {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @EqualsAndHashCode.Include
  @Column(name = "arbol_id")
  private Long id;

  @Column(name = "especie_id", nullable = false)
  private Long especieId;

  @Column(name = "provincia_id", nullable = false)
  private Long provinciaId;

  @Column(name = "usuario_app_id", nullable = false)
  private Long usuarioAppId;

  @Column(name = "municipio")
  private String municipio;

  @Column(name = "descripcion", columnDefinition = "TEXT")
  private String descripcion;

  @Column(name = "visibilidad_mapa_publico", length = 64)
  private String visibilidadMapaPublico;

  @Column(name = "latitud", nullable = false, precision = 10, scale = 7)
  private BigDecimal latitud;

  @Column(name = "longitud", nullable = false, precision = 10, scale = 7)
  private BigDecimal longitud;

  @Column(name = "altitud")
  private Integer altitud;

  @Column(name = "estado_publicacion", length = 64)
  private String estadoPublicacion;

  @Column(name = "creado_en", nullable = false)
  private Instant creadoEn;

  @Column(name = "creado_por")
  private Long creadoPor;

  @Column(name = "modificado_en", nullable = false)
  private Instant modificadoEn;

  @Column(name = "modificado_por")
  private Long modificadoPor;
}
