package co.com.goldrain.surveyve.concepts.survey.infrastructure.mapper;

import co.com.goldrain.surveyve.concepts.respondent.infrastructure.mapper.RespondentMapper;
import co.com.goldrain.surveyve.concepts.survey.domain.Survey;
import co.com.goldrain.surveyve.concepts.survey.infrastructure.entity.SurveyEntity;
import co.com.goldrain.surveyve.concepts.surveypage.infrastructure.mapper.SurveyPageMapper;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring", uses = {SurveyPageMapper.class, RespondentMapper.class})
public interface SurveyMapper {
    SurveyMapper INSTANCE = Mappers.getMapper(SurveyMapper.class);

    Survey toDomain(SurveyEntity surveyEntity);

    List<Survey> toDomainList(List<SurveyEntity> surveyEntities);

    SurveyEntity toEntity(Survey survey);

    List<SurveyEntity> toEntityList(List<Survey> surveys);
}