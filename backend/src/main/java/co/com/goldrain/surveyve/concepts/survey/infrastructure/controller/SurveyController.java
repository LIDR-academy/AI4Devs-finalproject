package co.com.goldrain.surveyve.concepts.survey.infrastructure.controller;

import co.com.goldrain.surveyve.concepts.survey.application.service.SurveyService;
import co.com.goldrain.surveyve.concepts.survey.domain.Survey;
import co.com.goldrain.surveyve.concepts.survey.domain.dto.SurveyDTO;
import co.com.goldrain.surveyve.concepts.survey.infrastructure.mapper.SurveyMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/surveys")
@RequiredArgsConstructor
@Tag(name = "Survey", description = "Survey management APIs")
public class SurveyController {

    private final SurveyService surveyService;

    @PostMapping
    @Operation(summary = "Create a new survey")
    public ResponseEntity<Survey> createSurvey(@RequestBody SurveyDTO surveyDTO) {
        surveyDTO.fix();
        Survey survey = surveyService.getSurveyMapper().toDomain(surveyDTO);
        return ResponseEntity.ok(surveyService.createSurvey(survey));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing survey")
    public ResponseEntity<Survey> updateSurvey(@PathVariable UUID id, @RequestBody SurveyDTO surveyDTO) {
        surveyDTO.fix();
        Survey survey = surveyService.getSurveyMapper().toDomain(surveyDTO);
        survey.setId(id);
        return ResponseEntity.ok(surveyService.updateSurvey(survey));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a survey")
    public ResponseEntity<Void> deleteSurvey(@PathVariable UUID id) {
        surveyService.deleteSurvey(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a survey by ID")
    public ResponseEntity<Survey> getSurveyById(@PathVariable UUID id) {
        Survey surveyById = surveyService.getSurveyById(id);
        return Optional.ofNullable(surveyById)
                .map(surveyByIdOpt -> ResponseEntity.ok(surveyById))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping
    @Operation(summary = "Get all surveys")
    public ResponseEntity<List<Survey>> getAllSurveys(@RequestParam String filter) {
        return ResponseEntity.ok(surveyService.getAllSurveys(filter));
    }
}