package co.com.goldrain.surveyve.concepts.answer.application.service;

import co.com.goldrain.surveyve.concepts.answer.domain.Answer;
import co.com.goldrain.surveyve.concepts.answer.infrastructure.entity.AnswerEntity;
import co.com.goldrain.surveyve.concepts.answer.infrastructure.mapper.AnswerMapper;
import co.com.goldrain.surveyve.concepts.answer.infrastructure.repository.AnswerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class AnswerService {

    private final AnswerRepository answerRepository;
    private final AnswerMapper answerMapper;

    public Answer createAnswer(Answer answer) {
        return saveAnswer(answer);
    }

    public Answer updateAnswer(Answer answer) {
        return saveAnswer(answer);
    }

    private Answer saveAnswer(Answer answer) {
        AnswerEntity answerEntity = answerMapper.toEntity(answer);
        answerEntity = answerRepository.save(answerEntity);
        return answerMapper.toDomain(answerEntity);
    }

    public void deleteAnswer(UUID id) {
        answerRepository.deleteById(id);
    }

    public Answer getAnswerById(UUID id) {
        return answerRepository.findById(id)
                .map(answerMapper::toDomain)
                .orElse(null);
    }

    public List<Answer> getAllAnswers() {
        return answerRepository.findAll().stream()
                .map(answerMapper::toDomain)
                .toList();
    }
}