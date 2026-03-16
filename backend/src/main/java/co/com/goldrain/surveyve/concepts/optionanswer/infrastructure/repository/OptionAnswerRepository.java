package co.com.goldrain.surveyve.concepts.optionanswer.infrastructure.repository;

import co.com.goldrain.surveyve.concepts.optionanswer.infrastructure.entity.OptionAnswerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface OptionAnswerRepository extends JpaRepository<OptionAnswerEntity, UUID> {
}