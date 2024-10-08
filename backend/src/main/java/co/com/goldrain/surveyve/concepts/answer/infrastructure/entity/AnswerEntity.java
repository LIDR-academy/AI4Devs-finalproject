package co.com.goldrain.surveyve.concepts.answer.infrastructure.entity;

import co.com.goldrain.surveyve.concepts.answeroption.infrastructure.entity.AnswerOptionEntity;
import jakarta.persistence.*;

import java.util.List;
import java.util.UUID;

import co.com.goldrain.surveyve.concepts.question.infrastructure.entity.QuestionEntity;
import co.com.goldrain.surveyve.concepts.respondent.infrastructure.entity.RespondentEntity;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "ANSWER")
@Getter
@Setter
public class AnswerEntity {
    @Id
    private UUID id;

    private String textValue;

    @Column(name = "question_id")
    private UUID question;

    @Column(name = "respondent_id")
    private UUID respondent;

    private String json;

}