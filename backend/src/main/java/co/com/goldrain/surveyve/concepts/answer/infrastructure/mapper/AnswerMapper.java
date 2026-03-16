package co.com.goldrain.surveyve.concepts.answer.infrastructure.mapper;

import co.com.goldrain.surveyve.concepts.answer.domain.Answer;
import co.com.goldrain.surveyve.concepts.answer.infrastructure.entity.AnswerEntity;
import co.com.goldrain.surveyve.concepts.answeroption.infrastructure.mapper.AnswerOptionMapper;
import co.com.goldrain.surveyve.concepts.respondent.infrastructure.mapper.RespondentMapper;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring", uses = {RespondentMapper.class, AnswerOptionMapper.class})
public interface AnswerMapper {
    AnswerMapper INSTANCE = Mappers.getMapper(AnswerMapper.class);

    Answer toDomain(AnswerEntity answerEntity);

    List<Answer> toDomainList(List<AnswerEntity> answerEntities);

    AnswerEntity toEntity(Answer answer);

    List<AnswerEntity> toEntityList(List<Answer> answers);
}