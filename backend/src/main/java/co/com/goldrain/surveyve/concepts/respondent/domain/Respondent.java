package co.com.goldrain.surveyve.concepts.respondent.domain;

import co.com.goldrain.surveyve.concepts.answer.domain.Answer;
import co.com.goldrain.surveyve.concepts.survey.domain.Survey;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class Respondent {
    private UUID id;
    private String name;
    private String email;
    private String phone;
    private UUID survey;
}