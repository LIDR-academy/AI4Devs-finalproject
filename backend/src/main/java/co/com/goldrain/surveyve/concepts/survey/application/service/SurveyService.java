package co.com.goldrain.surveyve.concepts.survey.application.service;

import co.com.goldrain.surveyve.concepts.question.application.service.QuestionService;
import co.com.goldrain.surveyve.concepts.survey.domain.Survey;
import co.com.goldrain.surveyve.concepts.survey.infrastructure.entity.SurveyEntity;
import co.com.goldrain.surveyve.concepts.survey.infrastructure.mapper.SurveyMapper;
import co.com.goldrain.surveyve.concepts.survey.infrastructure.repository.SurveyRepository;
import co.com.goldrain.surveyve.concepts.surveypage.application.service.SurveyPageService;
import co.com.goldrain.surveyve.concepts.surveypage.domain.SurveyPage;
import co.com.goldrain.surveyve.shared.util.JsonUtils;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class SurveyService {

    private final SurveyRepository surveyRepository;
    private final SurveyPageService surveyPageService;
    private final QuestionService questionService;


    @Getter
    private final SurveyMapper surveyMapper;


    public Survey createSurvey(Survey survey) {
        return saveSurvey(survey);
    }

    public Survey updateSurvey(Survey survey) {
        return saveSurvey(survey);
    }

    private Survey saveSurvey(Survey survey) {
        SurveyEntity surveyEntity = surveyMapper.toEntity(survey);
        surveyEntity = surveyRepository.save(surveyEntity);
        savePages(survey, surveyEntity);
        return surveyMapper.toDomain(surveyEntity);
    }

    private void savePages(Survey survey, SurveyEntity surveyEntity) {
    if (survey.getPages() != null) {
        survey.getPages().forEach(page -> {
            page.setSurvey(surveyEntity.getId());
            page.setJson(JsonUtils.toJson(page));
            surveyPageService.saveSurveyPage(page);
            saveQuestionsByPage(page);
        });
    }
}

    private void saveQuestionsByPage(SurveyPage page) {
    if (page.getQuestions() != null) {
        page.getQuestions().forEach(question -> {
            question.setJson(JsonUtils.toJson(question));
            questionService.saveQuestion(question);
        });
    }
}

    public void deleteSurvey(UUID id) {
        surveyRepository.deleteById(id);
    }

    public Survey getSurveyById(UUID id) {
        return surveyRepository.findById(id)
                .map(surveyMapper::toDomain)
                .orElse(null);
    }

    public List<Survey> getAllSurveys(String filter) {
        ExampleMatcher matcher = ExampleMatcher.matchingAny()
                .withIgnoreNullValues()
                .withStringMatcher(ExampleMatcher.StringMatcher.CONTAINING)
                .withIgnoreCase()
                .withMatcher("title", ExampleMatcher.GenericPropertyMatcher::contains)
                .withMatcher("description", ExampleMatcher.GenericPropertyMatcher::contains)
                .withIgnorePaths("templateId")
                ;
        SurveyEntity surveyEntity = new SurveyEntity();
        if (filter != null && !filter.isBlank()) {
            surveyEntity.setTitle(filter);
            surveyEntity.setDescription(filter);
        }
        Example<SurveyEntity> example = Example.of(surveyEntity, matcher);
        return surveyRepository.findAll(example).stream()
                .map(surveyMapper::toDomain)
                .toList();
    }
}