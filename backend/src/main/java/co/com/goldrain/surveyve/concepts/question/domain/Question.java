package co.com.goldrain.surveyve.concepts.question.domain;

import co.com.goldrain.surveyve.concepts.answer.domain.Answer;
import co.com.goldrain.surveyve.concepts.optionanswer.domain.OptionAnswer;
import co.com.goldrain.surveyve.concepts.survey.domain.Survey;
import co.com.goldrain.surveyve.concepts.surveypage.domain.SurveyPage;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class Question {
    private UUID id;
    private String type;
    private String name;
    private String title;
    private boolean isRequired;
    private boolean visible;
    private boolean readOnly;
    private String autocomplete;
    private String inputType;
    private Min min;
    private Max max;
    private Double step;
    private String placeholder;
    private Integer rateCount;
    private Integer rateMax;
    private List<?> rateValues;
    private String rateType;
    private List<?> choices;

    private int templateId;
    private UUID survey;
    private UUID surveyPage;
    private String json;
}