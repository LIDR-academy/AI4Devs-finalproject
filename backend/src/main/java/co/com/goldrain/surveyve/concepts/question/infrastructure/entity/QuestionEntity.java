package co.com.goldrain.surveyve.concepts.question.infrastructure.entity;

import co.com.goldrain.surveyve.concepts.answer.infrastructure.entity.AnswerEntity;
import co.com.goldrain.surveyve.concepts.optionanswer.infrastructure.entity.OptionAnswerEntity;
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
    private UUID id;

    private String type;
    private String name;
    private String title;
    private boolean isRequired;
    private boolean visible;
    private boolean readOnly;
    private String autocomplete;
    private String inputType;
    private String min;
    private String max;
    private Double step;
    private String placeholder;
    private Integer rateCount;
    private Integer rateMax;

    @Column(length = 10000)
    private String rateValues;
    private String rateType;

    @Column(length = 10000)
    private String choices;

    @Column(name = "survey_id")
    private UUID survey;

    @Column(name = "survey_page_id")
    private UUID surveyPage;

    @Column(length = 10000)
    private String json;
}