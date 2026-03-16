package co.com.goldrain.surveyve.concepts.optionanswer.infrastructure.controller;

import co.com.goldrain.surveyve.concepts.optionanswer.application.service.OptionAnswerService;
import co.com.goldrain.surveyve.concepts.optionanswer.domain.OptionAnswer;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/option-answers")
@RequiredArgsConstructor
@Tag(name = "OptionAnswer", description = "Option Answer management APIs")
public class OptionAnswerController {

    private final OptionAnswerService optionAnswerService;

    @PostMapping
    @Operation(summary = "Create a new option answer")
    public ResponseEntity<OptionAnswer> createOptionAnswer(@RequestBody OptionAnswer optionAnswer) {
        return ResponseEntity.ok(optionAnswerService.createOptionAnswer(optionAnswer));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing option answer")
    public ResponseEntity<OptionAnswer> updateOptionAnswer(@PathVariable UUID id, @RequestBody OptionAnswer optionAnswer) {
        optionAnswer.setId(id);
        return ResponseEntity.ok(optionAnswerService.updateOptionAnswer(optionAnswer));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an option answer")
    public ResponseEntity<Void> deleteOptionAnswer(@PathVariable UUID id) {
        optionAnswerService.deleteOptionAnswer(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get an option answer by ID")
    public ResponseEntity<OptionAnswer> getOptionAnswerById(@PathVariable UUID id) {
        return ResponseEntity.ok(optionAnswerService.getOptionAnswerById(id));
    }

    @GetMapping
    @Operation(summary = "Get all option answers")
    public ResponseEntity<List<OptionAnswer>> getAllOptionAnswers() {
        return ResponseEntity.ok(optionAnswerService.getAllOptionAnswers());
    }
}