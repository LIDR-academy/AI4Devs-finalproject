package co.com.goldrain.surveyve.concepts.optionanswer.infrastructure.mapper;

import co.com.goldrain.surveyve.concepts.optionanswer.domain.OptionAnswer;
import co.com.goldrain.surveyve.concepts.optionanswer.infrastructure.entity.OptionAnswerEntity;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface OptionAnswerMapper {
    OptionAnswerMapper INSTANCE = Mappers.getMapper(OptionAnswerMapper.class);

    OptionAnswer toDomain(OptionAnswerEntity optionAnswerEntity);

    List<OptionAnswer> toDomainList(List<OptionAnswerEntity> optionAnswerEntities);

    OptionAnswerEntity toEntity(OptionAnswer optionAnswer);

    List<OptionAnswerEntity> toEntityList(List<OptionAnswer> optionAnswers);
}