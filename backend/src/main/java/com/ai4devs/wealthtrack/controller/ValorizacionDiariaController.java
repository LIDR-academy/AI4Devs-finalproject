package com.ai4devs.wealthtrack.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.ai4devs.wealthtrack.data.ValorizacionDiaria;
import com.ai4devs.wealthtrack.service.ValorizacionDiariaService;

@RestController
public class ValorizacionDiariaController {

    private final ValorizacionDiariaService valorizacionDiariaService;

    public ValorizacionDiariaController(ValorizacionDiariaService valorizacionDiariaService) {
        this.valorizacionDiariaService = valorizacionDiariaService;
    }

    @CrossOrigin(origins = "http://localhost:5173")
    @GetMapping("/valorizacion-diaria/{portfolioId}")
    public List<ValorizacionDiaria> getValorizacionDiariaByPortfolioId(@PathVariable Long portfolioId) {
        return valorizacionDiariaService.getValorizacionDiariaByPortfolioId(portfolioId);
                        //.stream().map(ResponseEntity::ok)
                //.orElse(ResponseEntity.notFound().build());

    }
}
