package co.com.goldrain.surveyve.concepts.answer.infrastructure.repository;

import co.com.goldrain.surveyve.concepts.answer.infrastructure.entity.AnswerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface AnswerRepository extends JpaRepository<AnswerEntity, UUID> {

    @Query("SELECT a.textValue, COUNT(a.id) FROM AnswerEntity a WHERE a.question = :questionId GROUP BY a.textValue")
    List<Object[]> countAnswersByOption(@Param("questionId") UUID questionId);
}