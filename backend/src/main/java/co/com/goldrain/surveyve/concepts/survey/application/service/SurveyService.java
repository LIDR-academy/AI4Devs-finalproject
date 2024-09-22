package co.com.goldrain.surveyve.concepts.survey.application.service;

import co.com.goldrain.surveyve.concepts.survey.domain.Survey;
import co.com.goldrain.surveyve.concepts.survey.infrastructure.entity.SurveyEntity;
import co.com.goldrain.surveyve.concepts.survey.infrastructure.mapper.SurveyMapper;
import co.com.goldrain.surveyve.concepts.survey.infrastructure.repository.SurveyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class SurveyService {

    private final SurveyRepository surveyRepository;

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
        return surveyMapper.toDomain(surveyEntity);
    }

    public void deleteSurvey(UUID id) {
        surveyRepository.deleteById(id);
    }

    public Survey getSurveyById(UUID id) {
        return surveyRepository.findById(id)
                .map(surveyMapper::toDomain)
                .orElse(null);
    }

    public List<Survey> getAllSurveys() {
        return surveyRepository.findAll().stream()
                .map(surveyMapper::toDomain)
                .toList();
    }
}