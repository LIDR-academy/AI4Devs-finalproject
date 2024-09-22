package co.com.goldrain.surveyve.concepts.question.infrastructure.repository;

import co.com.goldrain.surveyve.concepts.question.infrastructure.entity.QuestionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface QuestionRepository extends JpaRepository<QuestionEntity, UUID> {
}