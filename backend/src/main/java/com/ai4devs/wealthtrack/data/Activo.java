package com.ai4devs.wealthtrack.data;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Activos")
public class Activo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "portfolio_id", nullable = false)
    private Long portfolioId;

    @Column(name="tipo", nullable = false, length = 50)
    private String tipo;

    @Column(name="nombre", nullable = false, length = 255)
    private String nombre;

    @Column(name="ticker", length = 50)
    private String ticker;

    @Column(name="divisa", length = 10)
    private String divisa;

    @Column(name="tipo_cambio_divisa_compra", precision = 18, scale = 6)
    private BigDecimal tipoCambioDivisaCompra;

    @Column(name="fecha_compra")
    private LocalDate fechaCompra;

    @Column(name="numero_titulos")
    private Integer numeroTitulos;

    @Column(name="precio_medio_unitario", precision = 18, scale = 6)
    private BigDecimal precioMedioUnitario;

    @Column(name="coste_comisiones", precision = 18, scale = 2)
    private BigDecimal costeComisiones;

    @Column(name="precio_total_coste", precision = 18, scale = 2)
    private BigDecimal precioTotalCoste;

    @Column(name="precio_actual", precision = 18, scale = 2)
    private BigDecimal precioActual;

    @Column(name="ultima_valorizacion", precision = 18, scale = 2)
    private BigDecimal ultimaValorizacion;

    @Column(name="fecha_actualizacion")
    private LocalDate fechaActualizacion;

    @Column(name="tasa_interes_nominal", precision = 5, scale = 2)
    private BigDecimal tasaInteresNominal;

    @Column(name="plazo_inversion")
    private Integer plazoInversion;

    @Column(name="precio_unitario_venta", precision = 18, scale = 6)
    private BigDecimal precioUnitarioVenta;

    @Column(name="tipo_cambio_divisa_venta", precision = 18, scale = 6)
    private BigDecimal tipoCambioDivisaVenta;



}