package co.com.goldrain.surveyve.concepts.surveypage.infrastructure.repository;

import co.com.goldrain.surveyve.concepts.surveypage.infrastructure.entity.SurveyPageEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SurveyPageRepository extends JpaRepository<SurveyPageEntity, UUID> {
}