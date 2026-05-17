package com.mtl.notification.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "suscriptor", schema = "notification")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Suscriptor {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @EqualsAndHashCode.Include
  @Column(name = "suscriptor_id")
  private Long id;

  @Column(name = "email", nullable = false, length = 320)
  private String email;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.VARCHAR)
  @Column(name = "estado_suscripcion", nullable = false, length = 32)
  private EstadoSuscripcion estadoSuscripcion;

  @Column(name = "alta_en", nullable = false)
  private Instant altaEn;

  @Column(name = "confirmado_en")
  private Instant confirmadoEn;

  @Column(name = "baja_en")
  private Instant bajaEn;
}
