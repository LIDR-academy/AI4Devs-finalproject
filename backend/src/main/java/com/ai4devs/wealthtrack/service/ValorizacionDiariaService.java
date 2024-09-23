package com.ai4devs.wealthtrack.service;

import com.ai4devs.wealthtrack.repository.ValorizacionDiariaRepository;
import com.ai4devs.wealthtrack.data.ValorizacionDiaria;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ValorizacionDiariaService {

    private final ValorizacionDiariaRepository valorizacionDiariaRepository;

    public ValorizacionDiariaService(ValorizacionDiariaRepository valorizacionDiariaRepository) {
        this.valorizacionDiariaRepository = valorizacionDiariaRepository;
    }

    public List<ValorizacionDiaria> getValorizacionDiariaByPortfolioId(Long portfolioId) {
        return valorizacionDiariaRepository.findByPortfolioId(portfolioId)
                .stream()
                .sorted((vd1, vd2) -> vd1.getFecha().compareTo(vd2.getFecha()))
                .collect(Collectors.toList());
    }
}
