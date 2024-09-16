package com.ai4devs.wealthtrack.service;

import com.ai4devs.wealthtrack.data.Portfolio;
import com.ai4devs.wealthtrack.repository.PortfolioRepository;
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

    public Optional<Portfolio> getPortfolioAndActivesById(Long id) {
        var portfolio = getPortfolioById(id);
        portfolio.ifPresent(p -> p.getActivos());
        return portfolio;
    }
}
