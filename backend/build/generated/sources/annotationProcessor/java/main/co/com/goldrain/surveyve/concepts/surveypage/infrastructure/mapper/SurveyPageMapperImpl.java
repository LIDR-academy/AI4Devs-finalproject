package co.com.goldrain.surveyve.concepts.surveypage.infrastructure.mapper;

import co.com.goldrain.surveyve.concepts.question.infrastructure.mapper.QuestionMapper;
import co.com.goldrain.surveyve.concepts.survey.domain.dto.PageDTO;
import co.com.goldrain.surveyve.concepts.surveypage.domain.SurveyPage;
import co.com.goldrain.surveyve.concepts.surveypage.infrastructure.entity.SurveyPageEntity;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2024-09-29T18:12:27-0500",
    comments = "version: 1.6.1, compiler: IncrementalProcessingEnvironment from gradle-language-java-8.10.1.jar, environment: Java 21 (Microsoft)"
)
@Component
public class SurveyPageMapperImpl implements SurveyPageMapper {

    @Autowired
    private QuestionMapper questionMapper;

    @Override
    public SurveyPage toDomain(SurveyPageEntity surveyPageEntity) {
        if ( surveyPageEntity == null ) {
            return null;
        }

        SurveyPage surveyPage = new SurveyPage();

        surveyPage.setId( surveyPageEntity.getId() );
        surveyPage.setPageNumber( surveyPageEntity.getPageNumber() );
        surveyPage.setSurvey( surveyPageEntity.getSurvey() );
        surveyPage.setJson( surveyPageEntity.getJson() );
        surveyPage.setQuestions( questionMapper.toDomainList( surveyPageEntity.getQuestions() ) );

        return surveyPage;
    }

    @Override
    public SurveyPage toDomain(PageDTO pageDTO) {
        if ( pageDTO == null ) {
            return null;
        }

        SurveyPage surveyPage = new SurveyPage();

        surveyPage.setId( pageDTO.getId() );

        return surveyPage;
    }

    @Override
    public List<SurveyPage> toDomainList(List<SurveyPageEntity> surveyPageEntities) {
        if ( surveyPageEntities == null ) {
            return null;
        }

        List<SurveyPage> list = new ArrayList<SurveyPage>( surveyPageEntities.size() );
        for ( SurveyPageEntity surveyPageEntity : surveyPageEntities ) {
            list.add( toDomain( surveyPageEntity ) );
        }

        return list;
    }

    @Override
    public SurveyPageEntity toEntity(SurveyPage surveyPage) {
        if ( surveyPage == null ) {
            return null;
        }

        SurveyPageEntity surveyPageEntity = new SurveyPageEntity();

        surveyPageEntity.setId( surveyPage.getId() );
        surveyPageEntity.setPageNumber( surveyPage.getPageNumber() );
        surveyPageEntity.setSurvey( surveyPage.getSurvey() );
        surveyPageEntity.setJson( surveyPage.getJson() );
        surveyPageEntity.setQuestions( questionMapper.toEntityList( surveyPage.getQuestions() ) );

        return surveyPageEntity;
    }

    @Override
    public List<SurveyPageEntity> toEntityList(List<SurveyPage> surveyPages) {
        if ( surveyPages == null ) {
            return null;
        }

        List<SurveyPageEntity> list = new ArrayList<SurveyPageEntity>( surveyPages.size() );
        for ( SurveyPage surveyPage : surveyPages ) {
            list.add( toEntity( surveyPage ) );
        }

        return list;
    }
}
