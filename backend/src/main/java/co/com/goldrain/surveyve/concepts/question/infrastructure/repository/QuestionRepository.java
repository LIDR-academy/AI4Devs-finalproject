package co.com.goldrain.surveyve.concepts.question.infrastructure.repository;

import co.com.goldrain.surveyve.concepts.question.infrastructure.entity.QuestionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface QuestionRepository extends JpaRepository<QuestionEntity, UUID> {

    List<QuestionEntity> findBySurvey(UUID surveyId);

}