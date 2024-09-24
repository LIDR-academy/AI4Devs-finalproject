package com.ai4devs.wealthtrack.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class PortfolioResponse {

    @JsonProperty
    private Long id;

    @JsonProperty
    private String nombre;

    @JsonProperty
    private String divisaPrincipal;

    @JsonProperty
    private LocalDate fechaCreacion;

    @JsonProperty
    private Double valorActual;

}
