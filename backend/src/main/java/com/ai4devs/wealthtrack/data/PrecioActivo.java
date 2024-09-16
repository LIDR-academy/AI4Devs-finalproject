package com.ai4devs.wealthtrack.data;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Column;
import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "PreciosActivos")
public class PrecioActivo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "activo_id", nullable = false)
    private Activo activo;

    @Column(name="fecha", nullable = false)
    private LocalDate fecha;

    @Column(name="precio_cierre", nullable = false, precision = 18, scale = 6)
    private BigDecimal precioCierre;

    @Column(name="precio_apertura", precision = 18, scale = 6)
    private BigDecimal precioApertura;

    @Column(name="precio_maximo", precision = 18, scale = 6)
    private BigDecimal precioMaximo;

    @Column(name="precio_minimo", precision = 18, scale = 6)
    private BigDecimal precioMinimo;

    @Column(name="volumen")
    private Integer volumen;

}
