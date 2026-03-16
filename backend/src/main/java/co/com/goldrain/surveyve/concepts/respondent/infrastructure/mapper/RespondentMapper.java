package co.com.goldrain.surveyve.concepts.respondent.infrastructure.mapper;

import co.com.goldrain.surveyve.concepts.respondent.domain.Respondent;
import co.com.goldrain.surveyve.concepts.respondent.infrastructure.entity.RespondentEntity;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RespondentMapper {
    RespondentMapper INSTANCE = Mappers.getMapper(RespondentMapper.class);

    Respondent toDomain(RespondentEntity respondentEntity);

    List<Respondent> toDomainList(List<RespondentEntity> respondentEntities);

    RespondentEntity toEntity(Respondent respondent);

    List<RespondentEntity> toEntityList(List<Respondent> respondents);
}