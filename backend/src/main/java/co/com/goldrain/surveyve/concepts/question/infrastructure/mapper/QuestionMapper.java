package co.com.goldrain.surveyve.concepts.question.infrastructure.mapper;

import co.com.goldrain.surveyve.concepts.answer.infrastructure.mapper.AnswerMapper;
import co.com.goldrain.surveyve.concepts.optionanswer.infrastructure.mapper.OptionAnswerMapper;
import co.com.goldrain.surveyve.concepts.question.domain.Question;
import co.com.goldrain.surveyve.concepts.question.infrastructure.entity.QuestionEntity;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring", uses = {
        AnswerMapper.class,
        OptionAnswerMapper.class
})
public interface QuestionMapper {
    QuestionMapper INSTANCE = Mappers.getMapper(QuestionMapper.class);

    Question toDomain(QuestionEntity questionEntity);

    List<Question> toDomainList(List<QuestionEntity> questionEntities);

    QuestionEntity toEntity(Question question);

    List<QuestionEntity> toEntityList(List<Question> questions);
}