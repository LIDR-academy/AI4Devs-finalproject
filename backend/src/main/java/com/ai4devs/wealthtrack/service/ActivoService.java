package com.ai4devs.wealthtrack.service;

import com.ai4devs.wealthtrack.data.Activo;
import com.ai4devs.wealthtrack.repository.ActivoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActivoService {

    private final ActivoRepository activoRepository;

    public ActivoService(ActivoRepository activoRepository) {
        this.activoRepository = activoRepository;
    }

    public List<Activo> getActivoById(Long portfolioId) {
        return activoRepository.findByPortfolioId(portfolioId);
    }

}
