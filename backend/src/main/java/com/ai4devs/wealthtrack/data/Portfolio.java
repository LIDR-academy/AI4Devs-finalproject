package com.ai4devs.wealthtrack.data;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

import jakarta.persistence.Table;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;
import jakarta.persistence.OneToMany;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Portfolios")
public class Portfolio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="nombre", nullable = false)
    private String nombre;

    @Column(name="divisa_principal", nullable = false, length = 10)
    private String divisaPrincipal;

    @Column(name="fecha_creacion", nullable = false)
    private LocalDate fechaCreacion;

    @Column(name="valor_actual", nullable = false, precision = 18, scale = 2)
    private BigDecimal valorActual;

    @OneToMany(mappedBy = "portfolioId", orphanRemoval = true)
    private List<Activo> activos;

}
