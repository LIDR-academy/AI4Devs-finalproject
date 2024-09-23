package com.ai4devs.wealthtrack.controller;

import com.ai4devs.wealthtrack.response.PortfolioResponse;
import com.ai4devs.wealthtrack.service.PortfolioService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@Slf4j
public class PortfolioController {

    private final PortfolioService portfolioService;


    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @CrossOrigin(origins = "${app.cors.allowed-origins}")
    @GetMapping("/portfolio")
    public ResponseEntity<PortfolioResponse> getPortfolio() {
        Long usuarioId = obtenerUsuarioId();
        Optional<PortfolioResponse> portfolioAndActivesById = portfolioService.getPortfolioAndActivesById(usuarioId);

        log.info("result of portfolio retrieval by id {}: {}", usuarioId,
                portfolioAndActivesById.map(PortfolioResponse::toString));

        return portfolioAndActivesById
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    private Long obtenerUsuarioId() {
        // Implementa la lógica para obtener el ID del usuario autenticado
        // Por ejemplo, mapeando el nombre de usuario a un ID
        return 1L; // Placeholder
    }
}
