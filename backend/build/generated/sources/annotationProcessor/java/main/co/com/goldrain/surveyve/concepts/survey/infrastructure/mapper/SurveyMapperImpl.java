package co.com.goldrain.surveyve.concepts.survey.infrastructure.mapper;

import co.com.goldrain.surveyve.concepts.respondent.infrastructure.mapper.RespondentMapper;
import co.com.goldrain.surveyve.concepts.survey.domain.Survey;
import co.com.goldrain.surveyve.concepts.survey.infrastructure.entity.SurveyEntity;
import co.com.goldrain.surveyve.concepts.surveypage.infrastructure.mapper.SurveyPageMapper;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2024-09-22T16:12:48-0500",
    comments = "version: 1.6.1, compiler: IncrementalProcessingEnvironment from gradle-language-java-8.10.1.jar, environment: Java 21 (Microsoft)"
)
@Component
public class SurveyMapperImpl implements SurveyMapper {

    @Autowired
    private SurveyPageMapper surveyPageMapper;
    @Autowired
    private RespondentMapper respondentMapper;

    @Override
    public Survey toDomain(SurveyEntity surveyEntity) {
        if ( surveyEntity == null ) {
            return null;
        }

        Survey survey = new Survey();

        survey.setId( surveyEntity.getId() );
        survey.setTitle( surveyEntity.getTitle() );
        survey.setDescription( surveyEntity.getDescription() );
        survey.setTemplateId( surveyEntity.getTemplateId() );
        survey.setStatus( surveyEntity.getStatus() );
        survey.setPublicationDate( surveyEntity.getPublicationDate() );
        survey.setClosingDate( surveyEntity.getClosingDate() );
        survey.setPages( surveyPageMapper.toDomainList( surveyEntity.getPages() ) );
        survey.setRespondents( respondentMapper.toDomainList( surveyEntity.getRespondents() ) );

        return survey;
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
        surveyEntity.setTemplateId( survey.getTemplateId() );
        surveyEntity.setStatus( survey.getStatus() );
        surveyEntity.setPublicationDate( survey.getPublicationDate() );
        surveyEntity.setClosingDate( survey.getClosingDate() );
        surveyEntity.setPages( surveyPageMapper.toEntityList( survey.getPages() ) );
        surveyEntity.setRespondents( respondentMapper.toEntityList( survey.getRespondents() ) );

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
}
