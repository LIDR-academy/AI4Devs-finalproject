package co.com.goldrain.surveyve.concepts.answeroption.infrastructure.controller;

import co.com.goldrain.surveyve.concepts.answeroption.application.service.AnswerOptionService;
import co.com.goldrain.surveyve.concepts.answeroption.domain.AnswerOption;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/answer-options")
@RequiredArgsConstructor
@Tag(name = "AnswerOption", description = "Answer Option management APIs")
public class AnswerOptionController {

    private final AnswerOptionService answerOptionService;

    @PostMapping
    @Operation(summary = "Create a new answer option")
    public ResponseEntity<AnswerOption> createAnswerOption(@RequestBody AnswerOption answerOption) {
        return ResponseEntity.ok(answerOptionService.createAnswerOption(answerOption));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing answer option")
    public ResponseEntity<AnswerOption> updateAnswerOption(@PathVariable UUID id, @RequestBody AnswerOption answerOption) {
        answerOption.setId(id);
        return ResponseEntity.ok(answerOptionService.updateAnswerOption(answerOption));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an answer option")
    public ResponseEntity<Void> deleteAnswerOption(@PathVariable UUID id) {
        answerOptionService.deleteAnswerOption(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get an answer option by ID")
    public ResponseEntity<AnswerOption> getAnswerOptionById(@PathVariable UUID id) {
        return ResponseEntity.ok(answerOptionService.getAnswerOptionById(id));
    }

    @GetMapping
    @Operation(summary = "Get all answer options")
    public ResponseEntity<List<AnswerOption>> getAllAnswerOptions() {
        return ResponseEntity.ok(answerOptionService.getAllAnswerOptions());
    }
}