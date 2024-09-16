package com.ai4devs.wealthtrack.service;

import com.ai4devs.wealthtrack.repository.ValorizacionDiariaRepository;
import com.ai4devs.wealthtrack.data.ValorizacionDiaria;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ValorizacionDiariaService {

    private final ValorizacionDiariaRepository valorizacionDiariaRepository;

    public ValorizacionDiariaService(ValorizacionDiariaRepository valorizacionDiariaRepository) {
        this.valorizacionDiariaRepository = valorizacionDiariaRepository;
    }

    public List<ValorizacionDiaria> getValorizacionDiariaByPortfolioId(Long portfolioId) {
        return valorizacionDiariaRepository.findByPortfolioId(portfolioId);
    }
}
