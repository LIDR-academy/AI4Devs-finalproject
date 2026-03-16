package co.com.goldrain.surveyve.concepts.respondent.application.service;

import co.com.goldrain.surveyve.concepts.respondent.domain.Respondent;
import co.com.goldrain.surveyve.concepts.respondent.infrastructure.entity.RespondentEntity;
import co.com.goldrain.surveyve.concepts.respondent.infrastructure.mapper.RespondentMapper;
import co.com.goldrain.surveyve.concepts.respondent.infrastructure.repository.RespondentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class RespondentService {

    private final RespondentRepository respondentRepository;
    private final RespondentMapper respondentMapper;

    public Respondent createRespondent(Respondent respondent) {
        return saveRespondent(respondent);
    }

    public Respondent updateRespondent(Respondent respondent) {
        return saveRespondent(respondent);
    }

    private Respondent saveRespondent(Respondent respondent) {
        RespondentEntity respondentEntity = respondentMapper.toEntity(respondent);
        respondentEntity = respondentRepository.save(respondentEntity);
        return respondentMapper.toDomain(respondentEntity);
    }

    public void deleteRespondent(UUID id) {
        respondentRepository.deleteById(id);
    }

    public Respondent getRespondentById(UUID id) {
        return respondentRepository.findById(id)
                .map(respondentMapper::toDomain)
                .orElse(null);
    }

    public List<Respondent> getAllRespondents() {
        return respondentRepository.findAll().stream()
                .map(respondentMapper::toDomain)
                .toList();
    }

    public Optional<Respondent> getRespondentByEmail(String email) {
        return respondentRepository.findFirstByEmail(email).map(respondentMapper::toDomain);
    }

    public List<Respondent> getRespondentsBySurveyId(UUID surveyId) {
        return respondentRepository.findDistinctRespondentsBySurveyId(surveyId).stream()
                .map(respondentMapper::toDomain)
                .toList();
    }
}