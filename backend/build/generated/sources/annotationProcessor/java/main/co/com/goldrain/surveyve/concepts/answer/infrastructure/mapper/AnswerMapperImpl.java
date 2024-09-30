package co.com.goldrain.surveyve.concepts.answer.infrastructure.mapper;

import co.com.goldrain.surveyve.concepts.answer.domain.Answer;
import co.com.goldrain.surveyve.concepts.answer.infrastructure.entity.AnswerEntity;
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
public class AnswerMapperImpl implements AnswerMapper {

    @Override
    public Answer toDomain(AnswerEntity answerEntity) {
        if ( answerEntity == null ) {
            return null;
        }

        Answer answer = new Answer();

        answer.setId( answerEntity.getId() );
        answer.setTextValue( answerEntity.getTextValue() );
        answer.setQuestion( answerEntity.getQuestion() );
        answer.setRespondent( answerEntity.getRespondent() );

        return answer;
    }

    @Override
    public List<Answer> toDomainList(List<AnswerEntity> answerEntities) {
        if ( answerEntities == null ) {
            return null;
        }

        List<Answer> list = new ArrayList<Answer>( answerEntities.size() );
        for ( AnswerEntity answerEntity : answerEntities ) {
            list.add( toDomain( answerEntity ) );
        }

        return list;
    }

    @Override
    public AnswerEntity toEntity(Answer answer) {
        if ( answer == null ) {
            return null;
        }

        AnswerEntity answerEntity = new AnswerEntity();

        answerEntity.setId( answer.getId() );
        answerEntity.setTextValue( answer.getTextValue() );
        answerEntity.setQuestion( answer.getQuestion() );
        answerEntity.setRespondent( answer.getRespondent() );

        return answerEntity;
    }

    @Override
    public List<AnswerEntity> toEntityList(List<Answer> answers) {
        if ( answers == null ) {
            return null;
        }

        List<AnswerEntity> list = new ArrayList<AnswerEntity>( answers.size() );
        for ( Answer answer : answers ) {
            list.add( toEntity( answer ) );
        }

        return list;
    }
}
