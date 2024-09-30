package co.com.goldrain.surveyve.concepts.question.application.service;

import co.com.goldrain.surveyve.concepts.question.domain.Question;
import co.com.goldrain.surveyve.concepts.question.infrastructure.entity.QuestionEntity;
import co.com.goldrain.surveyve.concepts.question.infrastructure.mapper.QuestionMapper;
import co.com.goldrain.surveyve.concepts.question.infrastructure.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final QuestionMapper questionMapper;

    public Question createQuestion(Question question) {
        return saveQuestion(question);
    }

    public Question updateQuestion(Question question) {
        return saveQuestion(question);
    }

    public Question saveQuestion(Question question) {
        QuestionEntity questionEntity = questionMapper.toEntity(question);
        questionEntity = questionRepository.save(questionEntity);
        return questionMapper.toDomain(questionEntity);
    }

    public void deleteQuestion(UUID id) {
        questionRepository.deleteById(id);
    }

    public Question getQuestionById(UUID id) {
        return questionRepository.findById(id)
                .map(questionMapper::toDomain)
                .orElse(null);
    }

    public List<Question> getAllQuestions() {
        return questionRepository.findAll().stream()
                .map(questionMapper::toDomain)
                .toList();
    }
}