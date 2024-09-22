package co.com.goldrain.surveyve.concepts.optionanswer.infrastructure.entity;

import co.com.goldrain.surveyve.concepts.answeroption.infrastructure.entity.AnswerOptionEntity;
import co.com.goldrain.surveyve.concepts.question.infrastructure.entity.QuestionEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "OPTION_ANSWER")
@Getter
@Setter
public class OptionAnswerEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private String value;
    private boolean isCorrect;

    @ManyToOne
    @JoinColumn(name = "question_id")
    private QuestionEntity question;

    @OneToMany(mappedBy = "optionAnswer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AnswerOptionEntity> answerOptions;
}