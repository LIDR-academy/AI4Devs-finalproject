package co.com.goldrain.surveyve.concepts.surveypage.infrastructure.entity;

import co.com.goldrain.surveyve.concepts.question.infrastructure.entity.QuestionEntity;
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
    private UUID id;

    private int pageNumber;

    @Column(name = "survey_id")
    private UUID survey;

    @Column(length = 10000)
    private String json;

    @OneToMany(mappedBy = "surveyPage", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuestionEntity> questions;
}