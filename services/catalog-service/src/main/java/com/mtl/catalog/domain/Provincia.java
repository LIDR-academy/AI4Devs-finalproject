package com.mtl.catalog.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "provincia", schema = "catalog")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Provincia {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @EqualsAndHashCode.Include
  @Column(name = "provincia_id")
  private Long id;

  @Column(name = "codigo", nullable = false, length = 2)
  private String codigo;

  @Column(name = "nombre", nullable = false)
  private String nombre;

  @Column(name = "creado_en", nullable = false)
  private Instant creadoEn;

  @Column(name = "creado_por")
  private Long creadoPor;

  @Column(name = "modificado_en", nullable = false)
  private Instant modificadoEn;

  @Column(name = "modificado_por")
  private Long modificadoPor;
}
