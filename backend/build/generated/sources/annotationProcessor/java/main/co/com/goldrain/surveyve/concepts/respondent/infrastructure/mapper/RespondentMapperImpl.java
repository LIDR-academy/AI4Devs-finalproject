package co.com.goldrain.surveyve.concepts.respondent.infrastructure.mapper;

import co.com.goldrain.surveyve.concepts.respondent.domain.Respondent;
import co.com.goldrain.surveyve.concepts.respondent.infrastructure.entity.RespondentEntity;
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
public class RespondentMapperImpl implements RespondentMapper {

    @Override
    public Respondent toDomain(RespondentEntity respondentEntity) {
        if ( respondentEntity == null ) {
            return null;
        }

        Respondent respondent = new Respondent();

        respondent.setId( respondentEntity.getId() );
        respondent.setName( respondentEntity.getName() );
        respondent.setEmail( respondentEntity.getEmail() );
        respondent.setPhone( respondentEntity.getPhone() );
        respondent.setSurvey( respondentEntity.getSurvey() );

        return respondent;
    }

    @Override
    public List<Respondent> toDomainList(List<RespondentEntity> respondentEntities) {
        if ( respondentEntities == null ) {
            return null;
        }

        List<Respondent> list = new ArrayList<Respondent>( respondentEntities.size() );
        for ( RespondentEntity respondentEntity : respondentEntities ) {
            list.add( toDomain( respondentEntity ) );
        }

        return list;
    }

    @Override
    public RespondentEntity toEntity(Respondent respondent) {
        if ( respondent == null ) {
            return null;
        }

        RespondentEntity respondentEntity = new RespondentEntity();

        respondentEntity.setId( respondent.getId() );
        respondentEntity.setName( respondent.getName() );
        respondentEntity.setEmail( respondent.getEmail() );
        respondentEntity.setPhone( respondent.getPhone() );
        respondentEntity.setSurvey( respondent.getSurvey() );

        return respondentEntity;
    }

    @Override
    public List<RespondentEntity> toEntityList(List<Respondent> respondents) {
        if ( respondents == null ) {
            return null;
        }

        List<RespondentEntity> list = new ArrayList<RespondentEntity>( respondents.size() );
        for ( Respondent respondent : respondents ) {
            list.add( toEntity( respondent ) );
        }

        return list;
    }
}
