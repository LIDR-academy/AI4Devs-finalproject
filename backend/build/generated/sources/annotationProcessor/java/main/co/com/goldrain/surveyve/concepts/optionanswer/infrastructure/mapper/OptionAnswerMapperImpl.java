package co.com.goldrain.surveyve.concepts.optionanswer.infrastructure.mapper;

import co.com.goldrain.surveyve.concepts.optionanswer.domain.OptionAnswer;
import co.com.goldrain.surveyve.concepts.optionanswer.infrastructure.entity.OptionAnswerEntity;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2024-09-29T16:41:51-0500",
    comments = "version: 1.6.1, compiler: IncrementalProcessingEnvironment from gradle-language-java-8.10.1.jar, environment: Java 21 (Microsoft)"
)
@Component
public class OptionAnswerMapperImpl implements OptionAnswerMapper {

    @Override
    public OptionAnswer toDomain(OptionAnswerEntity optionAnswerEntity) {
        if ( optionAnswerEntity == null ) {
            return null;
        }

        OptionAnswer optionAnswer = new OptionAnswer();

        optionAnswer.setId( optionAnswerEntity.getId() );
        optionAnswer.setValue( optionAnswerEntity.getValue() );
        optionAnswer.setCorrect( optionAnswerEntity.isCorrect() );
        optionAnswer.setQuestion( optionAnswerEntity.getQuestion() );

        return optionAnswer;
    }

    @Override
    public List<OptionAnswer> toDomainList(List<OptionAnswerEntity> optionAnswerEntities) {
        if ( optionAnswerEntities == null ) {
            return null;
        }

        List<OptionAnswer> list = new ArrayList<OptionAnswer>( optionAnswerEntities.size() );
        for ( OptionAnswerEntity optionAnswerEntity : optionAnswerEntities ) {
            list.add( toDomain( optionAnswerEntity ) );
        }

        return list;
    }

    @Override
    public OptionAnswerEntity toEntity(OptionAnswer optionAnswer) {
        if ( optionAnswer == null ) {
            return null;
        }

        OptionAnswerEntity optionAnswerEntity = new OptionAnswerEntity();

        optionAnswerEntity.setId( optionAnswer.getId() );
        optionAnswerEntity.setValue( optionAnswer.getValue() );
        optionAnswerEntity.setCorrect( optionAnswer.isCorrect() );
        optionAnswerEntity.setQuestion( optionAnswer.getQuestion() );

        return optionAnswerEntity;
    }

    @Override
    public List<OptionAnswerEntity> toEntityList(List<OptionAnswer> optionAnswers) {
        if ( optionAnswers == null ) {
            return null;
        }

        List<OptionAnswerEntity> list = new ArrayList<OptionAnswerEntity>( optionAnswers.size() );
        for ( OptionAnswer optionAnswer : optionAnswers ) {
            list.add( toEntity( optionAnswer ) );
        }

        return list;
    }
}
