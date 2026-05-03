package com.provx.driving_test.controllers;

import com.provx.driving_test.dtos.request.QuestionRequest;
import com.provx.driving_test.dtos.response.ApiResponse;
import com.provx.driving_test.dtos.response.QuestionResponse;
import com.provx.driving_test.services.QuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;

    // GET /api/questions
    // Admin only — view full question bank with correct answers
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<QuestionResponse>>> getAllQuestions() {
        return ResponseEntity.ok(
                ApiResponse.success("Questions retrieved", questionService.getAllQuestions()));
    }

    // GET /api/questions/{id}
    // Admin only — view a single question with correct answer
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<QuestionResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Question retrieved", questionService.getById(id)));
    }

    // POST /api/questions
    // Admin only — create a new question
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<QuestionResponse>> create(
            @Valid @RequestBody QuestionRequest request) {

        QuestionResponse data = questionService.create(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Question created successfully", data));
    }

    // PUT /api/questions/{id}
    // Admin only — update an existing question
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<QuestionResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody QuestionRequest request) {

        QuestionResponse data = questionService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success("Question updated successfully", data));
    }

    // DELETE /api/questions/{id}
    // Admin only — soft delete (deactivate) a question
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable Long id) {
        questionService.deactivate(id);
        return ResponseEntity.ok(ApiResponse.success("Question deactivated successfully"));
    }
}