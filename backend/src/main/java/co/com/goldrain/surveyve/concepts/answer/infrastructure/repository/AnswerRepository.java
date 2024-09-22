package co.com.goldrain.surveyve.concepts.answer.infrastructure.repository;

import co.com.goldrain.surveyve.concepts.answer.infrastructure.entity.AnswerEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AnswerRepository extends JpaRepository<AnswerEntity, UUID> {
}