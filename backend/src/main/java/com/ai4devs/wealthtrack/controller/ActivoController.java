package com.ai4devs.wealthtrack.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ai4devs.wealthtrack.data.Activo;
import com.ai4devs.wealthtrack.service.ActivoService;

@RestController
@RequestMapping("/activos")
public class ActivoController {

    private final ActivoService activoService;

    public ActivoController(ActivoService activoService) {
        this.activoService = activoService;
    }

    @GetMapping("/{portfolioId}")
    public List<Activo> getActivoById(@PathVariable Long portfolioId) {
        return activoService.getActivoById(portfolioId);
    }
}
