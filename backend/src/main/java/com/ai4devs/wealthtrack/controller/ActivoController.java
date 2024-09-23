package com.ai4devs.wealthtrack.controller;

import com.ai4devs.wealthtrack.response.ActivoResponse;
import com.ai4devs.wealthtrack.service.ActivoService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/activos")
@Slf4j
public class ActivoController {



    private final ActivoService activoService;

    public ActivoController(ActivoService activoService) {
        this.activoService = activoService;
    }

    @CrossOrigin(origins = "${app.cors.allowed-origins}")
    @GetMapping("/{portfolioId}")
    public List<ActivoResponse> getActivoById(@PathVariable Long portfolioId) {
        List<ActivoResponse> activoById = activoService.getActivoById(portfolioId);
        log.info("result of activo by id {}: {}", portfolioId, activoById);

        return activoById;
    }
}
