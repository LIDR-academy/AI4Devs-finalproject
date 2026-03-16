package co.com.goldrain.surveyve.concepts.answeroption.infrastructure.mapper;

import co.com.goldrain.surveyve.concepts.answeroption.domain.AnswerOption;
import co.com.goldrain.surveyve.concepts.answeroption.infrastructure.entity.AnswerOptionEntity;
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
public class AnswerOptionMapperImpl implements AnswerOptionMapper {

    @Override
    public AnswerOption toDomain(AnswerOptionEntity answerOptionEntity) {
        if ( answerOptionEntity == null ) {
            return null;
        }

        AnswerOption answerOption = new AnswerOption();

        answerOption.setId( answerOptionEntity.getId() );
        answerOption.setAnswer( answerOptionEntity.getAnswer() );
        answerOption.setOptionAnswer( answerOptionEntity.getOptionAnswer() );

        return answerOption;
    }

    @Override
    public List<AnswerOption> toDomainList(List<AnswerOptionEntity> answerOptionEntities) {
        if ( answerOptionEntities == null ) {
            return null;
        }

        List<AnswerOption> list = new ArrayList<AnswerOption>( answerOptionEntities.size() );
        for ( AnswerOptionEntity answerOptionEntity : answerOptionEntities ) {
            list.add( toDomain( answerOptionEntity ) );
        }

        return list;
    }

    @Override
    public AnswerOptionEntity toEntity(AnswerOption answerOption) {
        if ( answerOption == null ) {
            return null;
        }

        AnswerOptionEntity answerOptionEntity = new AnswerOptionEntity();

        answerOptionEntity.setId( answerOption.getId() );
        answerOptionEntity.setAnswer( answerOption.getAnswer() );
        answerOptionEntity.setOptionAnswer( answerOption.getOptionAnswer() );

        return answerOptionEntity;
    }

    @Override
    public List<AnswerOptionEntity> toEntityList(List<AnswerOption> answerOptions) {
        if ( answerOptions == null ) {
            return null;
        }

        List<AnswerOptionEntity> list = new ArrayList<AnswerOptionEntity>( answerOptions.size() );
        for ( AnswerOption answerOption : answerOptions ) {
            list.add( toEntity( answerOption ) );
        }

        return list;
    }
}
