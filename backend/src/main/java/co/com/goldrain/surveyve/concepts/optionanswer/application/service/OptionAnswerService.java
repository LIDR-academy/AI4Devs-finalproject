package co.com.goldrain.surveyve.concepts.optionanswer.application.service;

import co.com.goldrain.surveyve.concepts.optionanswer.domain.OptionAnswer;
import co.com.goldrain.surveyve.concepts.optionanswer.infrastructure.entity.OptionAnswerEntity;
import co.com.goldrain.surveyve.concepts.optionanswer.infrastructure.mapper.OptionAnswerMapper;
import co.com.goldrain.surveyve.concepts.optionanswer.infrastructure.repository.OptionAnswerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class OptionAnswerService {

    private final OptionAnswerRepository optionAnswerRepository;
    private final OptionAnswerMapper optionAnswerMapper;

    public OptionAnswer createOptionAnswer(OptionAnswer optionAnswer) {
        return saveOptionAnswer(optionAnswer);
    }

    public OptionAnswer updateOptionAnswer(OptionAnswer optionAnswer) {
        return saveOptionAnswer(optionAnswer);
    }

    private OptionAnswer saveOptionAnswer(OptionAnswer optionAnswer) {
        OptionAnswerEntity optionAnswerEntity = optionAnswerMapper.toEntity(optionAnswer);
        optionAnswerEntity = optionAnswerRepository.save(optionAnswerEntity);
        return optionAnswerMapper.toDomain(optionAnswerEntity);
    }

    public void deleteOptionAnswer(UUID id) {
        optionAnswerRepository.deleteById(id);
    }

    public OptionAnswer getOptionAnswerById(UUID id) {
        return optionAnswerRepository.findById(id)
                .map(optionAnswerMapper::toDomain)
                .orElse(null);
    }

    public List<OptionAnswer> getAllOptionAnswers() {
        return optionAnswerRepository.findAll().stream()
                .map(optionAnswerMapper::toDomain)
                .toList();
    }
}