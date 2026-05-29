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
