package co.com.goldrain.surveyve.concepts.answeroption.application.service;

import co.com.goldrain.surveyve.concepts.answeroption.domain.AnswerOption;
import co.com.goldrain.surveyve.concepts.answeroption.infrastructure.entity.AnswerOptionEntity;
import co.com.goldrain.surveyve.concepts.answeroption.infrastructure.mapper.AnswerOptionMapper;
import co.com.goldrain.surveyve.concepts.answeroption.infrastructure.repository.AnswerOptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class AnswerOptionService {

    private final AnswerOptionRepository answerOptionRepository;
    private final AnswerOptionMapper answerOptionMapper;

    public AnswerOption createAnswerOption(AnswerOption answerOption) {
        return saveAnswerOption(answerOption);
    }

    public AnswerOption updateAnswerOption(AnswerOption answerOption) {
        return saveAnswerOption(answerOption);
    }

    private AnswerOption saveAnswerOption(AnswerOption answerOption) {
        AnswerOptionEntity answerOptionEntity = answerOptionMapper.toEntity(answerOption);
        answerOptionEntity = answerOptionRepository.save(answerOptionEntity);
        return answerOptionMapper.toDomain(answerOptionEntity);
    }

    public void deleteAnswerOption(UUID id) {
        answerOptionRepository.deleteById(id);
    }

    public AnswerOption getAnswerOptionById(UUID id) {
        return answerOptionRepository.findById(id)
                .map(answerOptionMapper::toDomain)
                .orElse(null);
    }

    public List<AnswerOption> getAllAnswerOptions() {
        return answerOptionRepository.findAll().stream()
                .map(answerOptionMapper::toDomain)
                .toList();
    }
}