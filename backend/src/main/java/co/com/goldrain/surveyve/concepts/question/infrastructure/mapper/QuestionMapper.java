package co.com.goldrain.surveyve.concepts.question.infrastructure.mapper;

import co.com.goldrain.surveyve.concepts.answer.infrastructure.mapper.AnswerMapper;
import co.com.goldrain.surveyve.concepts.optionanswer.infrastructure.mapper.OptionAnswerMapper;
import co.com.goldrain.surveyve.concepts.question.domain.Max;
import co.com.goldrain.surveyve.concepts.question.domain.Min;
import co.com.goldrain.surveyve.concepts.question.domain.Question;
import co.com.goldrain.surveyve.concepts.question.infrastructure.entity.QuestionEntity;
import co.com.goldrain.surveyve.concepts.survey.domain.dto.ElementDTO;
import co.com.goldrain.surveyve.shared.util.JsonUtils;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring", uses = {
        AnswerMapper.class,
        OptionAnswerMapper.class
})
public interface QuestionMapper {
    QuestionMapper INSTANCE = Mappers.getMapper(QuestionMapper.class);

    Question toDomain(QuestionEntity questionEntity);

    Question toDomain(ElementDTO elementDTO);

    default List<?> map(String value) {
        if (value == null) {
            return List.of();
        }
        return JsonUtils.parse(value, List.class);
    }

    default String map(List<?> value) {
        if (value == null) {
            return null;
        }
        return JsonUtils.toJson(value);
    }

    default Min mapMin(String value) {
        if (value == null) {
            return null;
        }
        Min min = new Min();
        try {
            min.setNumber(Double.parseDouble(value));
            return min;
        } catch (Exception e) {
            min.setDate(value);
        }
        return min;
    }

    default Max mapMax(String value) {
        if (value == null) {
            return null;
        }
        Max max = new Max();
        try {
            max.setNumber(Double.parseDouble(value));
            return max;
        } catch (Exception e) {
            max.setDate(value);
        }
        return max;
    }

    List<Question> toDomainList(List<QuestionEntity> questionEntities);

    QuestionEntity toEntity(Question question);


    default String map(Min value) {
        if (value == null) {
            return null;
        }
        return JsonUtils.toJson(value);
    }

    default String map(Max value) {
        if (value == null) {
            return null;
        }
        return JsonUtils.toJson(value);
    }

    default void afterMapping(Question question, @MappingTarget QuestionEntity questionEntity) {
        if (question.getRateValues() != null) {
            questionEntity.setRateValues(JsonUtils.toJson(question.getRateValues()));
        }
        if (question.getChoices() != null) {
            questionEntity.setChoices(JsonUtils.toJson(question.getChoices()));
        }
    }

    default void afterMapping(QuestionEntity questionEntity, @MappingTarget Question question) {
        if (questionEntity.getRateValues() != null) {
            question.setRateValues(JsonUtils.parse(questionEntity.getRateValues(), List.class));
        }
        if (questionEntity.getChoices() != null) {
            question.setChoices(JsonUtils.parse(questionEntity.getChoices(), List.class));
        }
    }

    List<QuestionEntity> toEntityList(List<Question> questions);
}