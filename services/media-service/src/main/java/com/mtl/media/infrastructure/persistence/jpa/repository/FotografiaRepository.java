package com.mtl.media.infrastructure.persistence.jpa.repository;

import com.mtl.media.domain.CategoriaFotografia;
import com.mtl.media.domain.Fotografia;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FotografiaRepository extends JpaRepository<Fotografia, Long> {

  @Query(
      "SELECT f FROM Fotografia f WHERE f.ejemplarId = :ejemplarId AND f.esPrincipal = true AND f.categoria = :categoria ORDER BY f.fotografiaId ASC")
  Optional<Fotografia> findPrincipalForEjemplar(
      @Param("ejemplarId") long ejemplarId, @Param("categoria") CategoriaFotografia categoria);

  @Query("SELECT COUNT(f) FROM Fotografia f WHERE f.ejemplarId = :ejemplarId")
  int countActiveForEjemplar(@Param("ejemplarId") long ejemplarId);

  @Query(
      "SELECT f FROM Fotografia f WHERE f.ejemplarId = :ejemplarId ORDER BY f.esPrincipal DESC, f.orden ASC, f.fotografiaId ASC")
  List<Fotografia> findActiveForEjemplarOrdered(@Param("ejemplarId") long ejemplarId);

  @Query(
      "SELECT f FROM Fotografia f WHERE f.ejemplarId = :ejemplarId AND f.categoria = 'PUBLIC' ORDER BY f.esPrincipal DESC, f.orden ASC, f.fotografiaId ASC")
  List<Fotografia> findPublicForEjemplarOrdered(@Param("ejemplarId") long ejemplarId);

  @Query("SELECT f FROM Fotografia f WHERE f.ejemplarId = :ejemplarId")
  List<Fotografia> findAllByEjemplarId(@Param("ejemplarId") long ejemplarId);

  @Query("SELECT f FROM Fotografia f WHERE f.fotografiaId = :photoId")
  Optional<Fotografia> findActiveById(@Param("photoId") long photoId);
}
