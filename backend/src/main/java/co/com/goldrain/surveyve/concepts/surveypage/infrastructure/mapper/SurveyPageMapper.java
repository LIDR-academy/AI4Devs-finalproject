package co.com.goldrain.surveyve.concepts.surveypage.infrastructure.mapper;

import co.com.goldrain.surveyve.concepts.question.infrastructure.mapper.QuestionMapper;
import co.com.goldrain.surveyve.concepts.surveypage.domain.SurveyPage;
import co.com.goldrain.surveyve.concepts.surveypage.infrastructure.entity.SurveyPageEntity;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring", uses = {QuestionMapper.class})
public interface SurveyPageMapper {
    SurveyPageMapper INSTANCE = Mappers.getMapper(SurveyPageMapper.class);

    SurveyPage toDomain(SurveyPageEntity surveyPageEntity);

    List<SurveyPage> toDomainList(List<SurveyPageEntity> surveyPageEntities);

    SurveyPageEntity toEntity(SurveyPage surveyPage);

    List<SurveyPageEntity> toEntityList(List<SurveyPage> surveyPages);
}