package co.com.goldrain.surveyve.concepts.survey.infrastructure.repository;

import co.com.goldrain.surveyve.concepts.survey.domain.Survey;
import co.com.goldrain.surveyve.concepts.survey.infrastructure.entity.SurveyEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.QueryByExampleExecutor;

import java.util.UUID;

public interface SurveyRepository extends JpaRepository<SurveyEntity, UUID>, QueryByExampleExecutor<SurveyEntity> {
}