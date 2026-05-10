package com.mtl.catalog.infrastructure.persistence.jpa.repository;

import com.mtl.catalog.domain.UsuarioApp;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioAppRepository extends JpaRepository<UsuarioApp, Long> {

  Optional<UsuarioApp> findBySubjectOidc(String subjectOidc);
}
