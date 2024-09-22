package co.com.goldrain.surveyve.concepts.answer.domain;

import co.com.goldrain.surveyve.concepts.answeroption.domain.AnswerOption;
import co.com.goldrain.surveyve.concepts.question.domain.Question;
import co.com.goldrain.surveyve.concepts.respondent.domain.Respondent;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class Answer {
    private UUID id;
    private String textValue;
    private Question question;
    private Respondent respondent;
    private List<AnswerOption> answerOptions;
}