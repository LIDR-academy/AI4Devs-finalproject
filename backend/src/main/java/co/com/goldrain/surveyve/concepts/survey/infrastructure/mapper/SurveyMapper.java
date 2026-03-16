package co.com.goldrain.surveyve.concepts.survey.infrastructure.mapper;

import co.com.goldrain.surveyve.concepts.question.domain.Question;
import co.com.goldrain.surveyve.concepts.question.infrastructure.mapper.QuestionMapper;
import co.com.goldrain.surveyve.concepts.respondent.infrastructure.mapper.RespondentMapper;
import co.com.goldrain.surveyve.concepts.survey.domain.Survey;
import co.com.goldrain.surveyve.concepts.survey.domain.dto.PageDTO;
import co.com.goldrain.surveyve.concepts.survey.domain.dto.SurveyDTO;
import co.com.goldrain.surveyve.concepts.survey.infrastructure.entity.SurveyEntity;
import co.com.goldrain.surveyve.concepts.surveypage.domain.SurveyPage;
import co.com.goldrain.surveyve.concepts.surveypage.infrastructure.mapper.SurveyPageMapper;
import co.com.goldrain.surveyve.shared.util.JsonUtils;
import org.mapstruct.*;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring", uses = {SurveyPageMapper.class, RespondentMapper.class})
public interface SurveyMapper {
    SurveyMapper INSTANCE = Mappers.getMapper(SurveyMapper.class);

    Survey toDomain(SurveyEntity surveyEntity);

    @Mappings(
            {
                    @Mapping(
                            target = "pages",
                            ignore = true
                    ),
                    @Mapping(
                            target = "respondents",
                            ignore = true
                    )
            }
    )
    Survey toDomain(SurveyDTO surveyDTO);

    SurveyDTO toDto(Survey survey);

    default List<?> map(String rateValues) {
        if (rateValues != null) {
            return null;
        }
        return JsonUtils.parse(rateValues, List.class);
    }

    List<Survey> toDomainList(List<SurveyEntity> surveyEntities);

    SurveyEntity toEntity(Survey survey);

    List<SurveyEntity> toEntityList(List<Survey> surveys);

    @AfterMapping
    default void mapAdditionalProperties(SurveyDTO surveyDTO, @MappingTarget Survey survey) {
        mapSurveyPages(surveyDTO, survey);
        survey.setJson(JsonUtils.toJson(surveyDTO));
    }

    private static void mapSurveyPages(SurveyDTO surveyDTO, Survey survey) {
        if (surveyDTO.getPages() != null) {
            survey.setPages(
                    surveyDTO.getPages().stream()
                            .map(pageDTO -> {
                                SurveyPage surveyPage = SurveyPageMapper.INSTANCE.toDomain(pageDTO);
                                surveyPage.setSurvey(survey.getId());
                                mapQuestions(pageDTO, surveyPage);
                                return surveyPage;
                            })
                            .toList()
            );
        }
    }

    private static void mapQuestions(PageDTO pageDTO, SurveyPage surveyPage) {
        if (pageDTO.getElements() != null) {
            surveyPage.setQuestions(
                    pageDTO.getElements().stream()
                            .map(elementDTO -> {
                                Question question = QuestionMapper.INSTANCE.toDomain(elementDTO);
                                question.setSurvey(surveyPage.getSurvey());
                                question.setSurveyPage(surveyPage.getId());
                                return question;
                            })
                            .toList()
            );
        }
    }
}