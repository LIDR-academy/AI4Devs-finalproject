package co.com.goldrain.surveyve.concepts.respondent.infrastructure.repository;

import co.com.goldrain.surveyve.concepts.respondent.infrastructure.entity.RespondentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RespondentRepository extends JpaRepository<RespondentEntity, UUID> {
    Optional<RespondentEntity> findFirstByEmail(String email);

    @Query("SELECT DISTINCT r FROM AnswerEntity a INNER JOIN RespondentEntity r ON a.respondent = r.id WHERE r.survey = :surveyId ORDER BY r.creationDate DESC")
    List<RespondentEntity> findDistinctRespondentsBySurveyId(@Param("surveyId") UUID surveyId);
}