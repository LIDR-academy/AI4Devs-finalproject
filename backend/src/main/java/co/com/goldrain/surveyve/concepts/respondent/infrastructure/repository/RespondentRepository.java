package co.com.goldrain.surveyve.concepts.respondent.infrastructure.repository;

import co.com.goldrain.surveyve.concepts.respondent.infrastructure.entity.RespondentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface RespondentRepository extends JpaRepository<RespondentEntity, UUID> {
}