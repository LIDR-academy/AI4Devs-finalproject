package com.ai4devs.wealthtrack.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ActivoResponse {

    @JsonProperty
    private Long id;

    @JsonProperty
    private Long portfolioId;

    @JsonProperty
    private String tipo;

    @JsonProperty
    private String nombre;
    
    @JsonProperty
    private String ticker;

    @JsonProperty
    private String divisa;
    
    @JsonProperty
    private BigDecimal tipoCambioDivisaCompra;
    
    @JsonProperty
    private LocalDate fechaCompra;
    
    @JsonProperty
    private Integer numeroTitulos;
    
    @JsonProperty
    private BigDecimal precioMedioUnitario;
    
    @JsonProperty
    private BigDecimal costeComisiones;

    @JsonProperty
    private BigDecimal precioTotalCoste;

    @JsonProperty
    private BigDecimal precioActual;

    @JsonProperty
    private BigDecimal ultimaValorizacion;

    @JsonProperty
    private LocalDate fechaActualizacion;

    @JsonProperty
    private BigDecimal tasaInteresNominal;

    @JsonProperty
    private Integer plazoInversion;

    @JsonProperty
    private BigDecimal precioUnitarioVenta;

    @JsonProperty
    private BigDecimal tipoCambioDivisaVenta;

    @JsonProperty
    private Double ganancia;

    @JsonProperty
    private Double gananciaPorcentaje;

}