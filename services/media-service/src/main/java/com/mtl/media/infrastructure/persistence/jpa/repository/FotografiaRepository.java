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
      "SELECT f FROM Fotografia f WHERE f.arbolId = :arbolId AND f.esPrincipal = true AND (f.categoria = :categoria OR f.categoria IS NULL) AND f.eliminadoEn IS NULL ORDER BY f.fotografiaId ASC")
  Optional<Fotografia> findPrincipalForTree(
      @Param("arbolId") long arbolId, @Param("categoria") CategoriaFotografia categoria);

  @Query("SELECT COUNT(f) FROM Fotografia f WHERE f.arbolId = :arbolId AND f.eliminadoEn IS NULL")
  int countActiveForTree(@Param("arbolId") long arbolId);

  @Query(
      "SELECT f FROM Fotografia f WHERE f.arbolId = :arbolId AND f.eliminadoEn IS NULL ORDER BY f.esPrincipal DESC, f.orden ASC, f.fotografiaId ASC")
  List<Fotografia> findActiveForTreeOrdered(@Param("arbolId") long arbolId);

  @Query(
      "SELECT f FROM Fotografia f WHERE f.arbolId = :arbolId AND f.eliminadoEn IS NULL AND (f.categoria = 'PUBLIC' OR f.categoria IS NULL OR (f.categoria = 'PRIVATE' AND f.subidaPor = :actorUsuarioAppId)) ORDER BY f.esPrincipal DESC, f.orden ASC, f.fotografiaId ASC")
  List<Fotografia> findVisibleForActorOrdered(
      @Param("arbolId") long arbolId, @Param("actorUsuarioAppId") long actorUsuarioAppId);

  @Query(
      "SELECT f FROM Fotografia f WHERE f.arbolId = :arbolId AND f.eliminadoEn IS NULL AND (f.categoria = 'PUBLIC' OR f.categoria IS NULL) ORDER BY f.esPrincipal DESC, f.orden ASC, f.fotografiaId ASC")
  List<Fotografia> findPublicForTreeOrdered(@Param("arbolId") long arbolId);

  @Query("SELECT f FROM Fotografia f WHERE f.arbolId = :arbolId")
  List<Fotografia> findAllByArbolId(@Param("arbolId") long arbolId);

  @Query(
      "SELECT f FROM Fotografia f WHERE f.fotografiaId = :photoId AND f.eliminadoEn IS NULL")
  Optional<Fotografia> findActiveById(@Param("photoId") long photoId);
}
