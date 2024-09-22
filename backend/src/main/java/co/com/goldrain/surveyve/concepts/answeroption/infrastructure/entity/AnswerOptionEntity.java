package co.com.goldrain.surveyve.concepts.answeroption.infrastructure.entity;

import co.com.goldrain.surveyve.concepts.answer.infrastructure.entity.AnswerEntity;
import co.com.goldrain.surveyve.concepts.optionanswer.infrastructure.entity.OptionAnswerEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "ANSWER_OPTION")
@Getter
@Setter
public class AnswerOptionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "answer_id")
    private AnswerEntity answer;

    @ManyToOne
    @JoinColumn(name = "option_answer_id")
    private OptionAnswerEntity optionAnswer;
}