package co.com.goldrain.surveyve.shared.config;

import co.com.goldrain.surveyve.concepts.answer.infrastructure.mapper.AnswerMapper;
import co.com.goldrain.surveyve.concepts.answeroption.infrastructure.mapper.AnswerOptionMapper;
import co.com.goldrain.surveyve.concepts.optionanswer.infrastructure.mapper.OptionAnswerMapper;
import co.com.goldrain.surveyve.concepts.question.infrastructure.mapper.QuestionMapper;
import co.com.goldrain.surveyve.concepts.survey.infrastructure.mapper.SurveyMapper;
import co.com.goldrain.surveyve.concepts.surveypage.infrastructure.mapper.SurveyPageMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MapperConfig {

    @Bean
    public AnswerMapper answerMapper() {
        return AnswerMapper.INSTANCE;
    }

    @Bean
    public AnswerOptionMapper answerOptionMapper() {
        return AnswerOptionMapper.INSTANCE;
    }

    @Bean
    public OptionAnswerMapper optionAnswerMapper() {
        return OptionAnswerMapper.INSTANCE;
    }

    @Bean
    public QuestionMapper questionMapper() {
        return QuestionMapper.INSTANCE;
    }

    @Bean
    public SurveyMapper surveyMapper() {
        return SurveyMapper.INSTANCE;
    }

    @Bean
    public SurveyPageMapper surveyPageMapper() {
        return SurveyPageMapper.INSTANCE;
    }
}