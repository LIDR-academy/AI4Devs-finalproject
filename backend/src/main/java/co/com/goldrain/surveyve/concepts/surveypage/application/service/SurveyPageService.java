package co.com.goldrain.surveyve.concepts.surveypage.application.service;

import co.com.goldrain.surveyve.concepts.surveypage.domain.SurveyPage;
import co.com.goldrain.surveyve.concepts.surveypage.infrastructure.entity.SurveyPageEntity;
import co.com.goldrain.surveyve.concepts.surveypage.infrastructure.mapper.SurveyPageMapper;
import co.com.goldrain.surveyve.concepts.surveypage.infrastructure.repository.SurveyPageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class SurveyPageService {

    private final SurveyPageRepository surveyPageRepository;
    private final SurveyPageMapper surveyPageMapper;

    public SurveyPage createSurveyPage(SurveyPage surveyPage) {
        return saveSurveyPage(surveyPage);
    }

    public SurveyPage updateSurveyPage(SurveyPage surveyPage) {
        return saveSurveyPage(surveyPage);
    }

    private SurveyPage saveSurveyPage(SurveyPage surveyPage) {
        SurveyPageEntity surveyPageEntity = surveyPageMapper.toEntity(surveyPage);
        surveyPageEntity = surveyPageRepository.save(surveyPageEntity);
        return surveyPageMapper.toDomain(surveyPageEntity);
    }

    public void deleteSurveyPage(UUID id) {
        surveyPageRepository.deleteById(id);
    }

    public SurveyPage getSurveyPageById(UUID id) {
        return surveyPageRepository.findById(id)
                .map(surveyPageMapper::toDomain)
                .orElse(null);
    }

    public List<SurveyPage> getAllSurveyPages() {
        return surveyPageRepository.findAll().stream()
                .map(surveyPageMapper::toDomain)
                .toList();
    }
}