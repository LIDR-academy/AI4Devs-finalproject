package co.com.goldrain.surveyve.concepts.answeroption.domain;

import co.com.goldrain.surveyve.concepts.answer.domain.Answer;
import co.com.goldrain.surveyve.concepts.optionanswer.domain.OptionAnswer;
import lombok.Data;

import java.util.UUID;

@Data
public class AnswerOption {
    private UUID id;
    private UUID answer;
    private UUID optionAnswer;
}