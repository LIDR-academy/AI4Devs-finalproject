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
    private String statement;
    private String type;
    private int templateId;
    private Survey survey;
    private SurveyPage surveyPage;
    private List<Answer> answers;
    private List<OptionAnswer> optionAnswers;
}