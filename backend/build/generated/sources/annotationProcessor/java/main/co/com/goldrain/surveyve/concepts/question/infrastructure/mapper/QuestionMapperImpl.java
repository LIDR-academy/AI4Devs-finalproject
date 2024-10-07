package co.com.goldrain.surveyve.concepts.question.infrastructure.mapper;

import co.com.goldrain.surveyve.concepts.question.domain.Question;
import co.com.goldrain.surveyve.concepts.question.infrastructure.entity.QuestionEntity;
import co.com.goldrain.surveyve.concepts.survey.domain.dto.ElementDTO;
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
public class QuestionMapperImpl implements QuestionMapper {

    @Override
    public Question toDomain(QuestionEntity questionEntity) {
        if ( questionEntity == null ) {
            return null;
        }

        Question question = new Question();

        question.setId( questionEntity.getId() );
        question.setType( questionEntity.getType() );
        question.setName( questionEntity.getName() );
        question.setTitle( questionEntity.getTitle() );
        question.setRequired( questionEntity.isRequired() );
        question.setVisible( questionEntity.isVisible() );
        question.setReadOnly( questionEntity.isReadOnly() );
        question.setAutocomplete( questionEntity.getAutocomplete() );
        question.setInputType( questionEntity.getInputType() );
        question.setMin( mapMin( questionEntity.getMin() ) );
        question.setMax( mapMax( questionEntity.getMax() ) );
        question.setStep( questionEntity.getStep() );
        question.setPlaceholder( questionEntity.getPlaceholder() );
        question.setRateCount( questionEntity.getRateCount() );
        question.setRateMax( questionEntity.getRateMax() );
        question.setRateValues( map( questionEntity.getRateValues() ) );
        question.setRateType( questionEntity.getRateType() );
        question.setChoices( map( questionEntity.getChoices() ) );
        question.setSurvey( questionEntity.getSurvey() );
        question.setSurveyPage( questionEntity.getSurveyPage() );
        question.setJson( questionEntity.getJson() );

        return question;
    }

    @Override
    public Question toDomain(ElementDTO elementDTO) {
        if ( elementDTO == null ) {
            return null;
        }

        Question question = new Question();

        question.setId( elementDTO.getId() );
        question.setType( elementDTO.getType() );
        question.setName( elementDTO.getName() );
        question.setTitle( elementDTO.getTitle() );
        question.setRequired( elementDTO.isRequired() );
        question.setVisible( elementDTO.isVisible() );
        question.setReadOnly( elementDTO.isReadOnly() );
        question.setAutocomplete( elementDTO.getAutocomplete() );
        question.setInputType( elementDTO.getInputType() );
        question.setMin( mapMin( elementDTO.getMin() ) );
        question.setMax( mapMax( elementDTO.getMax() ) );
        question.setStep( elementDTO.getStep() );
        question.setPlaceholder( elementDTO.getPlaceholder() );
        question.setRateCount( elementDTO.getRateCount() );
        question.setRateMax( elementDTO.getRateMax() );
        List<?> list = elementDTO.getRateValues();
        if ( list != null ) {
            question.setRateValues( new ArrayList<Object>( list ) );
        }
        question.setRateType( elementDTO.getRateType() );
        List<?> list1 = elementDTO.getChoices();
        if ( list1 != null ) {
            question.setChoices( new ArrayList<Object>( list1 ) );
        }

        return question;
    }

    @Override
    public List<Question> toDomainList(List<QuestionEntity> questionEntities) {
        if ( questionEntities == null ) {
            return null;
        }

        List<Question> list = new ArrayList<Question>( questionEntities.size() );
        for ( QuestionEntity questionEntity : questionEntities ) {
            list.add( toDomain( questionEntity ) );
        }

        return list;
    }

    @Override
    public QuestionEntity toEntity(Question question) {
        if ( question == null ) {
            return null;
        }

        QuestionEntity questionEntity = new QuestionEntity();

        questionEntity.setId( question.getId() );
        questionEntity.setType( question.getType() );
        questionEntity.setName( question.getName() );
        questionEntity.setTitle( question.getTitle() );
        questionEntity.setRequired( question.isRequired() );
        questionEntity.setVisible( question.isVisible() );
        questionEntity.setReadOnly( question.isReadOnly() );
        questionEntity.setAutocomplete( question.getAutocomplete() );
        questionEntity.setInputType( question.getInputType() );
        questionEntity.setMin( map( question.getMin() ) );
        questionEntity.setMax( map( question.getMax() ) );
        questionEntity.setStep( question.getStep() );
        questionEntity.setPlaceholder( question.getPlaceholder() );
        questionEntity.setRateCount( question.getRateCount() );
        questionEntity.setRateMax( question.getRateMax() );
        questionEntity.setRateValues( map( question.getRateValues() ) );
        questionEntity.setRateType( question.getRateType() );
        questionEntity.setChoices( map( question.getChoices() ) );
        questionEntity.setSurvey( question.getSurvey() );
        questionEntity.setSurveyPage( question.getSurveyPage() );
        questionEntity.setJson( question.getJson() );

        return questionEntity;
    }

    @Override
    public List<QuestionEntity> toEntityList(List<Question> questions) {
        if ( questions == null ) {
            return null;
        }

        List<QuestionEntity> list = new ArrayList<QuestionEntity>( questions.size() );
        for ( Question question : questions ) {
            list.add( toEntity( question ) );
        }

        return list;
    }
}
