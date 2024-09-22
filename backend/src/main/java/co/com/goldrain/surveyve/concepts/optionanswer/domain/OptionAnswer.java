package co.com.goldrain.surveyve.concepts.optionanswer.domain;

import co.com.goldrain.surveyve.concepts.answeroption.domain.AnswerOption;
import co.com.goldrain.surveyve.concepts.question.domain.Question;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class OptionAnswer {
    private UUID id;
    private String value;
    private boolean isCorrect;
    private Question question;
    private List<AnswerOption> answerOptions;
}