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
import jakarta.persistence.UniqueConstraint;
import java.time.OffsetDateTime;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "envio_notificacion",
    schema = "notification",
    uniqueConstraints =
        @UniqueConstraint(
            name = "uq_envio_notificacion_suscriptor",
            columnNames = {"notificacion_id", "suscriptor_id"}))
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class EnvioNotificacion {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @EqualsAndHashCode.Include
  @Column(name = "envio_id")
  private Long envioId;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "notificacion_id", nullable = false)
  private Notificacion notificacion;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "suscriptor_id", nullable = false)
  private Suscriptor suscriptor;

  @Column(name = "estado_envio", nullable = false, length = 32)
  private String estadoEnvio;

  @Column(name = "generada_en", nullable = false)
  private OffsetDateTime generadaEn;

  @Column(name = "enviada_en")
  private OffsetDateTime enviadaEn;

  @Column(name = "mensaje_error", length = 2000)
  private String mensajeError;
}
