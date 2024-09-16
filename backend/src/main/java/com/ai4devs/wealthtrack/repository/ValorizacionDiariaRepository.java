package com.ai4devs.wealthtrack.repository;

import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.ai4devs.wealthtrack.data.ValorizacionDiaria;

@Repository
public interface ValorizacionDiariaRepository extends CrudRepository<ValorizacionDiaria, Long> {

    List<ValorizacionDiaria> findByPortfolioId(Long portfolioId);




}
