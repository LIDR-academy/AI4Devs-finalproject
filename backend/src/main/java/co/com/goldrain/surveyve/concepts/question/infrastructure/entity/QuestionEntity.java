package co.com.goldrain.surveyve.concepts.question.infrastructure.entity;

import co.com.goldrain.surveyve.concepts.answer.infrastructure.entity.AnswerEntity;
import co.com.goldrain.surveyve.concepts.optionanswer.infrastructure.entity.OptionAnswerEntity;

import co.com.goldrain.surveyve.concepts.survey.infrastructure.entity.SurveyEntity;
import co.com.goldrain.surveyve.concepts.surveypage.infrastructure.entity.SurveyPageEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "QUESTION")
@Getter
@Setter
public class QuestionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private String statement;
    private String type;
    private int templateId;

    @ManyToOne
    @JoinColumn(name = "survey_id")
    private SurveyEntity survey;

    @ManyToOne
    @JoinColumn(name = "survey_page_id")
    private SurveyPageEntity surveyPage;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AnswerEntity> answers;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OptionAnswerEntity> optionAnswers;
}