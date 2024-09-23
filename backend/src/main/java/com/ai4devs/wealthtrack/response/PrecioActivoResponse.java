package com.ai4devs.wealthtrack.response;

import com.ai4devs.wealthtrack.data.Activo;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class PrecioActivoResponse {


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
