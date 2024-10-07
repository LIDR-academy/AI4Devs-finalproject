package co.com.goldrain.surveyve.concepts.respondent.infrastructure.controller;

import co.com.goldrain.surveyve.concepts.respondent.application.service.RespondentService;
import co.com.goldrain.surveyve.concepts.respondent.domain.Respondent;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/respondents")
@RequiredArgsConstructor
public class RespondentController {

    private final RespondentService respondentService;

    @PostMapping
    public ResponseEntity<Respondent> createRespondent(@RequestBody Respondent respondent) {
        Respondent createdRespondent = respondentService.createRespondent(respondent);
        return ResponseEntity.ok(createdRespondent);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Respondent> updateRespondent(@PathVariable UUID id, @RequestBody Respondent respondent) {
        respondent.setId(id);
        Respondent updatedRespondent = respondentService.updateRespondent(respondent);
        return ResponseEntity.ok(updatedRespondent);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRespondent(@PathVariable UUID id) {
        respondentService.deleteRespondent(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Respondent> getRespondentById(@PathVariable UUID id) {
        Respondent respondent = respondentService.getRespondentById(id);
        return ResponseEntity.ok(respondent);
    }

    @GetMapping
    public ResponseEntity<List<Respondent>> getAllRespondents() {
        List<Respondent> respondents = respondentService.getAllRespondents();
        return ResponseEntity.ok(respondents);
    }

    @GetMapping("/survey/{surveyId}")
    public ResponseEntity<List<Respondent>> getRespondentsBySurveyId(@PathVariable UUID surveyId) {
        List<Respondent> respondents = respondentService.getRespondentsBySurveyId(surveyId);
        return ResponseEntity.ok(respondents);
    }
}