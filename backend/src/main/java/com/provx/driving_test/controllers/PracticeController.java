package com.provx.driving_test.controllers;

import com.provx.driving_test.dtos.request.AnswerRequest;
import com.provx.driving_test.dtos.response.ApiResponse;
import com.provx.driving_test.dtos.response.PracticeAnswerResponse;
import com.provx.driving_test.dtos.response.PracticeSessionResponse;
import com.provx.driving_test.models.User;
import com.provx.driving_test.services.PracticeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/practice")
@RequiredArgsConstructor
public class PracticeController {

    private final PracticeService practiceService;

    // POST /api/practice/start
    // Start a new practice session — draws 20 random questions
    @PostMapping("/start")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<PracticeSessionResponse>> startSession(
            @AuthenticationPrincipal User user) {

        PracticeSessionResponse data = practiceService.startSession(user.getId());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Practice session started", data));
    }

    // GET /api/practice/{sessionId}
    // Get current session state — used when student refreshes mid-practice
    @GetMapping("/{sessionId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<PracticeSessionResponse>> getSession(
            @PathVariable Long sessionId,
            @AuthenticationPrincipal User user) {

        PracticeSessionResponse data = practiceService.getSession(sessionId, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Session retrieved", data));
    }

    // POST /api/practice/{sessionId}/answer
    // Submit a single answer — returns instant feedback (correct/wrong + correct option)
    @PostMapping("/{sessionId}/answer")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<PracticeAnswerResponse>> submitAnswer(
            @PathVariable Long sessionId,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody AnswerRequest request) {

        PracticeAnswerResponse data = practiceService.submitAnswer(sessionId, user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Answer submitted", data));
    }

    // GET /api/practice/history
    // Get student's full practice history
    @GetMapping("/history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<PracticeSessionResponse>>> getHistory(
            @AuthenticationPrincipal User user) {

        List<PracticeSessionResponse> data = practiceService.getHistory(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Practice history retrieved", data));
    }
}