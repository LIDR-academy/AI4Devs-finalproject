package co.com.goldrain.surveyve.concepts.answer.application.service;

import co.com.goldrain.surveyve.concepts.answer.domain.Answer;
import co.com.goldrain.surveyve.concepts.answer.infrastructure.entity.AnswerEntity;
import co.com.goldrain.surveyve.concepts.answer.infrastructure.mapper.AnswerMapper;
import co.com.goldrain.surveyve.concepts.answer.infrastructure.repository.AnswerRepository;
import co.com.goldrain.surveyve.concepts.respondent.application.service.RespondentService;
import co.com.goldrain.surveyve.concepts.respondent.domain.Respondent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class AnswerService {

    private final AnswerRepository answerRepository;
    private final AnswerMapper answerMapper;
    private final RespondentService respondentService;

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

    public void saveAnswers(UUID id, UUID emailId, UUID nameId, Map<UUID, String> answers) {
        String email = answers.get(emailId);
        String name = answers.get(nameId);

        Respondent respondent = respondentService.getRespondentByEmail(email)
                .orElseGet(() -> {
                    Respondent newRespondent = new Respondent();
                    newRespondent.setId(UUID.randomUUID());
                    newRespondent.setEmail(email);
                    newRespondent.setName(name);
                    newRespondent.setSurvey(id);
                    return respondentService.createRespondent(newRespondent);
                });

        answers.entrySet().stream()
                .filter(entry -> !entry.getKey().equals(emailId) && !entry.getKey().equals(nameId))
                .forEach(entry -> {
                    Answer answer = new Answer();
                    answer.setId(UUID.randomUUID());
                    answer.setQuestion(entry.getKey());
                    answer.setTextValue(entry.getValue());
                    answer.setRespondent(respondent.getId());
                    saveAnswer(answer);
                });
    }

    public List<Map<String, Object>> countAnswersByOption(UUID questionId) {
        return answerRepository.countAnswersByOption(questionId).stream()
                .map(result -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("name", result[0]);
                    map.put("value", result[1]);
                    return map;
                })
                .collect(Collectors.toList());
    }
}