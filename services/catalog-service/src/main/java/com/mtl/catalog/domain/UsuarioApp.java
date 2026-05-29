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
@Table(name = "usuario_app", schema = "catalog")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class UsuarioApp {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @EqualsAndHashCode.Include
  @Column(name = "usuario_app_id")
  private Long id;

  @Column(name = "subject_oidc", nullable = false, length = 255)
  private String subjectOidc;

  @Column(name = "email", length = 320)
  private String email;

  @Column(name = "nombre", length = 255)
  private String nombre;

  @Column(name = "creado_en", nullable = false)
  private OffsetDateTime creadoEn;

  @Column(name = "modificado_en", nullable = false)
  private OffsetDateTime modificadoEn;
}
