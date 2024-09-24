package com.ai4devs.wealthtrack.repository;

import com.ai4devs.wealthtrack.data.Portfolio;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PortfolioRepository extends CrudRepository<Portfolio, Long> {
}
