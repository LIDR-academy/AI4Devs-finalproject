package co.com.goldrain.surveyve.concepts.survey.infrastructure.mapper;

import co.com.goldrain.surveyve.concepts.survey.domain.Survey;
import co.com.goldrain.surveyve.concepts.survey.domain.dto.PageDTO;
import co.com.goldrain.surveyve.concepts.survey.domain.dto.SurveyDTO;
import co.com.goldrain.surveyve.concepts.survey.infrastructure.entity.SurveyEntity;
import co.com.goldrain.surveyve.concepts.surveypage.domain.SurveyPage;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2024-10-06T17:27:05-0500",
    comments = "version: 1.6.1, compiler: IncrementalProcessingEnvironment from gradle-language-java-8.10.1.jar, environment: Java 21 (Microsoft)"
)
@Component
public class SurveyMapperImpl implements SurveyMapper {

    @Override
    public Survey toDomain(SurveyEntity surveyEntity) {
        if ( surveyEntity == null ) {
            return null;
        }

        Survey survey = new Survey();

        survey.setId( surveyEntity.getId() );
        survey.setTitle( surveyEntity.getTitle() );
        survey.setDescription( surveyEntity.getDescription() );
        survey.setStatus( surveyEntity.getStatus() );
        survey.setPublicationDate( surveyEntity.getPublicationDate() );
        survey.setClosingDate( surveyEntity.getClosingDate() );
        survey.setJson( surveyEntity.getJson() );

        return survey;
    }

    @Override
    public Survey toDomain(SurveyDTO surveyDTO) {
        if ( surveyDTO == null ) {
            return null;
        }

        Survey survey = new Survey();

        survey.setId( surveyDTO.getId() );
        survey.setTitle( surveyDTO.getTitle() );
        survey.setDescription( surveyDTO.getDescription() );

        mapAdditionalProperties( surveyDTO, survey );

        return survey;
    }

    @Override
    public SurveyDTO toDto(Survey survey) {
        if ( survey == null ) {
            return null;
        }

        SurveyDTO surveyDTO = new SurveyDTO();

        surveyDTO.setId( survey.getId() );
        surveyDTO.setTitle( survey.getTitle() );
        surveyDTO.setDescription( survey.getDescription() );
        surveyDTO.setPages( surveyPageListToPageDTOList( survey.getPages() ) );

        return surveyDTO;
    }

    @Override
    public List<Survey> toDomainList(List<SurveyEntity> surveyEntities) {
        if ( surveyEntities == null ) {
            return null;
        }

        List<Survey> list = new ArrayList<Survey>( surveyEntities.size() );
        for ( SurveyEntity surveyEntity : surveyEntities ) {
            list.add( toDomain( surveyEntity ) );
        }

        return list;
    }

    @Override
    public SurveyEntity toEntity(Survey survey) {
        if ( survey == null ) {
            return null;
        }

        SurveyEntity surveyEntity = new SurveyEntity();

        surveyEntity.setId( survey.getId() );
        surveyEntity.setTitle( survey.getTitle() );
        surveyEntity.setDescription( survey.getDescription() );
        surveyEntity.setStatus( survey.getStatus() );
        surveyEntity.setPublicationDate( survey.getPublicationDate() );
        surveyEntity.setClosingDate( survey.getClosingDate() );
        surveyEntity.setJson( survey.getJson() );

        return surveyEntity;
    }

    @Override
    public List<SurveyEntity> toEntityList(List<Survey> surveys) {
        if ( surveys == null ) {
            return null;
        }

        List<SurveyEntity> list = new ArrayList<SurveyEntity>( surveys.size() );
        for ( Survey survey : surveys ) {
            list.add( toEntity( survey ) );
        }

        return list;
    }

    protected PageDTO surveyPageToPageDTO(SurveyPage surveyPage) {
        if ( surveyPage == null ) {
            return null;
        }

        PageDTO pageDTO = new PageDTO();

        pageDTO.setId( surveyPage.getId() );

        return pageDTO;
    }

    protected List<PageDTO> surveyPageListToPageDTOList(List<SurveyPage> list) {
        if ( list == null ) {
            return null;
        }

        List<PageDTO> list1 = new ArrayList<PageDTO>( list.size() );
        for ( SurveyPage surveyPage : list ) {
            list1.add( surveyPageToPageDTO( surveyPage ) );
        }

        return list1;
    }
}
