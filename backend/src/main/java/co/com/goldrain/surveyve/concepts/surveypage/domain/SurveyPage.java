package co.com.goldrain.surveyve.concepts.surveypage.domain;

import co.com.goldrain.surveyve.concepts.question.domain.Question;
import co.com.goldrain.surveyve.concepts.survey.domain.Survey;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class SurveyPage {
    private UUID id;
    private int pageNumber;
    private Survey survey;
    private List<Question> questions;
}