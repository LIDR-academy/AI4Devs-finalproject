package com.ai4devs.wealthtrack.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.ai4devs.wealthtrack.data.PrecioActivo;

@Repository
public interface PrecioActivoRepository extends CrudRepository<PrecioActivo, Long> {
    
}
