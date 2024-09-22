package co.com.goldrain.surveyve.concepts.answer.infrastructure.entity;

import co.com.goldrain.surveyve.concepts.answeroption.infrastructure.entity.AnswerOptionEntity;
import jakarta.persistence.*;

import java.util.List;
import java.util.UUID;

import co.com.goldrain.surveyve.concepts.question.infrastructure.entity.QuestionEntity;
import co.com.goldrain.surveyve.concepts.respondent.infrastructure.entity.RespondentEntity;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "ANSWER")
@Getter
@Setter
public class AnswerEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private String textValue;

    @ManyToOne
    @JoinColumn(name = "question_id")
    private QuestionEntity question;

    @ManyToOne
    @JoinColumn(name = "respondent_id")
    private RespondentEntity respondent;

    @OneToMany(mappedBy = "answer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AnswerOptionEntity> answerOptions;
}