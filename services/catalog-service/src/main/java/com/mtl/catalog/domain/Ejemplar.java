package com.mtl.catalog.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "ejemplar", schema = "catalog")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Ejemplar {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @EqualsAndHashCode.Include
  @Column(name = "ejemplar_id")
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "especie_id", nullable = false)
  private Especie especie;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "provincia_id", nullable = false)
  private Provincia provincia;

  public Long getEspecieId() {
    return especie != null ? especie.getId() : null;
  }

  public Long getProvinciaId() {
    return provincia != null ? provincia.getId() : null;
  }

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "usuario_app_id", nullable = false)
  private UsuarioApp usuarioApp;

  public Long getUsuarioAppId() {
    return usuarioApp != null ? usuarioApp.getId() : null;
  }

  @Column(name = "municipio")
  private String municipio;

  @Column(name = "descripcion", columnDefinition = "TEXT")
  private String descripcion;

  @Enumerated(EnumType.STRING)
  @Column(name = "visibilidad_mapa_publico", length = 64)
  private VisibilidadMapaPublico visibilidadMapaPublico;

  @Column(name = "latitud", nullable = false, precision = 10, scale = 7)
  private BigDecimal latitud;

  @Column(name = "longitud", nullable = false, precision = 10, scale = 7)
  private BigDecimal longitud;

  @Column(name = "altitud")
  private Integer altitud;

  @Enumerated(EnumType.STRING)
  @Column(name = "estado_publicacion", length = 64)
  private EstadoPublicacion estadoPublicacion;

  @CreatedDate
  @Column(name = "creado_en", nullable = false)
  private OffsetDateTime creadoEn;

  @CreatedBy
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "creado_por")
  private UsuarioApp creadoPor;

  @LastModifiedDate
  @Column(name = "modificado_en", nullable = false)
  private OffsetDateTime modificadoEn;

  @LastModifiedBy
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
