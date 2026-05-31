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
import java.time.OffsetDateTime;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "especie", schema = "catalog")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Especie {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @EqualsAndHashCode.Include
  @Column(name = "especie_id")
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "genero_id", nullable = false)
  private Genero genero;

  @Column(name = "nombre_cientifico", nullable = false)
  private String nombreCientifico;

  @Column(name = "nombre_comun")
  private String nombreComun;

  @Column(name = "creado_en", nullable = false)
  private OffsetDateTime creadoEn;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "creado_por")
  private UsuarioApp creadoPor;

  @Column(name = "modificado_en", nullable = false)
  private OffsetDateTime modificadoEn;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "modificado_por")
  private UsuarioApp modificadoPor;

  public Long getCreadoPorId() {
    return creadoPor != null ? creadoPor.getId() : null;
  }

  public Long getModificadoPorId() {
    return modificadoPor != null ? modificadoPor.getId() : null;
  }
}
