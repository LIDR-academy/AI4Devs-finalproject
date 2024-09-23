package com.ai4devs.wealthtrack.service;

import com.ai4devs.wealthtrack.data.Portfolio;
import com.ai4devs.wealthtrack.repository.PortfolioRepository;
import com.ai4devs.wealthtrack.response.PortfolioResponse;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class PortfolioService {

    private final PortfolioRepository portfolioRepository;

    public PortfolioService(PortfolioRepository portfolioRepository) {
        this.portfolioRepository = portfolioRepository;
    }

    public Optional<Portfolio> getPortfolioById(Long id) {
        return portfolioRepository.findById(id);
    }

    public Optional<PortfolioResponse> getPortfolioAndActivesById(Long id) {
        return getPortfolioById(id).map(this::mapToPortfolioResponse);

    }

    private PortfolioResponse mapToPortfolioResponse(Portfolio portfolio) {
        PortfolioResponse response = new PortfolioResponse();
        response.setId(portfolio.getId());
        response.setNombre(portfolio.getNombre());
        response.setDivisaPrincipal(portfolio.getDivisaPrincipal());
        response.setValorActual(portfolio.getValorActual().doubleValue());

        return response;
    }
}
