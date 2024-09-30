package co.com.goldrain.surveyve.concepts.respondent.infrastructure.entity;

import co.com.goldrain.surveyve.concepts.answer.infrastructure.entity.AnswerEntity;
import co.com.goldrain.surveyve.concepts.survey.infrastructure.entity.SurveyEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "RESPONDENT")
@Getter
@Setter
public class RespondentEntity {
    @Id
    private UUID id;

    private String name;
    private String email;
    private String phone;

    @Column(name = "survey_id")
    private UUID survey;

    private String json;

}