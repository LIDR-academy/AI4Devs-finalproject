package com.ai4devs.wealthtrack.repository;

import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.ai4devs.wealthtrack.data.Activo;

@Repository
public interface ActivoRepository extends CrudRepository<Activo, Long> {
    List<Activo> findByPortfolioId(Long portfolioId);

    
}
