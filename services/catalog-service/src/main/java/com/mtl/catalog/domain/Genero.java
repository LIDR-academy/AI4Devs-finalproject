package com.mtl.catalog.domain;

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
@Table(name = "genero", schema = "catalog")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Genero {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @EqualsAndHashCode.Include
  @Column(name = "genero_id")
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "familia_id", nullable = false)
  private Familia familia;

  @Column(name = "nombre_cientifico", nullable = false)
  private String nombreCientifico;

  @Column(name = "nombre_comun")
  private String nombreComun;

  @Column(name = "creado_en", nullable = false)
  private Instant creadoEn;

  @Column(name = "creado_por")
  private Long creadoPor;

  @Column(name = "modificado_en", nullable = false)
  private Instant modificadoEn;

  @Column(name = "modificado_por")
  private Long modificadoPor;
}
