package com.ai4devs.wealthtrack.controller;

import com.ai4devs.wealthtrack.data.Portfolio;
import com.ai4devs.wealthtrack.service.PortfolioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PortfolioController {

    private final PortfolioService portfolioService;


    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @GetMapping("/portfolio")
    public ResponseEntity<Portfolio> getPortfolio() {
        Long usuarioId = obtenerUsuarioId();
        return portfolioService.getPortfolioAndActivesById(usuarioId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    private Long obtenerUsuarioId() {
        // Implementa la lógica para obtener el ID del usuario autenticado
        // Por ejemplo, mapeando el nombre de usuario a un ID
        return 1L; // Placeholder
    }
}
