package co.com.goldrain.surveyve.concepts.question.infrastructure.controller;

import co.com.goldrain.surveyve.concepts.question.application.service.QuestionService;
import co.com.goldrain.surveyve.concepts.question.domain.Question;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
@Tag(name = "Question", description = "Question management APIs")
public class QuestionController {

    private final QuestionService questionService;

    @PostMapping
    @Operation(summary = "Create a new question")
    public ResponseEntity<Question> createQuestion(@RequestBody Question question) {
        return ResponseEntity.ok(questionService.createQuestion(question));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing question")
    public ResponseEntity<Question> updateQuestion(@PathVariable UUID id, @RequestBody Question question) {
        question.setId(id);
        return ResponseEntity.ok(questionService.updateQuestion(question));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a question")
    public ResponseEntity<Void> deleteQuestion(@PathVariable UUID id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a question by ID")
    public ResponseEntity<Question> getQuestionById(@PathVariable UUID id) {
        return ResponseEntity.ok(questionService.getQuestionById(id));
    }

    @GetMapping
    @Operation(summary = "Get all questions")
    public ResponseEntity<List<Question>> getAllQuestions() {
        return ResponseEntity.ok(questionService.getAllQuestions());
    }
}