package co.com.goldrain.surveyve.concepts.answeroption.infrastructure.repository;

import co.com.goldrain.surveyve.concepts.answeroption.infrastructure.entity.AnswerOptionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AnswerOptionRepository extends JpaRepository<AnswerOptionEntity, UUID> {
}