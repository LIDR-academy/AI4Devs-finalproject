package co.com.goldrain.surveyve.concepts.surveypage.infrastructure.entity;

import co.com.goldrain.surveyve.concepts.question.infrastructure.entity.QuestionEntity;
import co.com.goldrain.surveyve.concepts.survey.infrastructure.entity.SurveyEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "SURVEY_PAGE")
@Getter
@Setter
public class SurveyPageEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private int pageNumber;

    @ManyToOne
    @JoinColumn(name = "survey_id")
    private SurveyEntity survey;

    @OneToMany(mappedBy = "surveyPage", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuestionEntity> questions;
}