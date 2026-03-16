package co.com.goldrain.surveyve.concepts.answeroption.infrastructure.mapper;

import co.com.goldrain.surveyve.concepts.answeroption.domain.AnswerOption;
import co.com.goldrain.surveyve.concepts.answeroption.infrastructure.entity.AnswerOptionEntity;
import co.com.goldrain.surveyve.concepts.optionanswer.infrastructure.mapper.OptionAnswerMapper;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring", uses = {OptionAnswerMapper.class})
public interface AnswerOptionMapper {
    AnswerOptionMapper INSTANCE = Mappers.getMapper(AnswerOptionMapper.class);

    AnswerOption toDomain(AnswerOptionEntity answerOptionEntity);

    List<AnswerOption> toDomainList(List<AnswerOptionEntity> answerOptionEntities);

    AnswerOptionEntity toEntity(AnswerOption answerOption);

    List<AnswerOptionEntity> toEntityList(List<AnswerOption> answerOptions);
}