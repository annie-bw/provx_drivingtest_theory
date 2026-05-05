package com.provx.driving_test.controllers;

import com.provx.driving_test.dtos.request.AnswerRequest;
import com.provx.driving_test.dtos.response.ApiResponse;
import com.provx.driving_test.dtos.response.DashboardResponse;
import com.provx.driving_test.dtos.response.ExamAnswerResponse;
import com.provx.driving_test.dtos.response.ExamResponse;
import com.provx.driving_test.dtos.response.PaginatedResponse;
import com.provx.driving_test.models.User;
import com.provx.driving_test.services.AdminService;
import com.provx.driving_test.services.ExamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/exams")
@RequiredArgsConstructor
public class ExamController {

    private final ExamService examService;
    private final AdminService adminService;

    // POST /api/exams/start
    // Start a new timed exam — draws 20 random questions, sets 20-min timer
    @PostMapping("/start")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<ExamResponse>> startExam(
            @AuthenticationPrincipal User user) {

        ExamResponse data = examService.startExam(user.getId());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Exam started. You have 20 minutes.", data));
    }

    // GET /api/exams/{examId}
    // Get current exam state — restores navigator grid if student refreshes
    @GetMapping("/{examId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<ExamResponse>> getExam(
            @PathVariable Long examId,
            @AuthenticationPrincipal User user) {

        ExamResponse data = examService.getExam(examId, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Exam retrieved", data));
    }

    // POST /api/exams/{examId}/answer
    // Save a single answer mid-exam — does NOT grade, just stores selection
    // Student can change their answer anytime before submitting
    @PostMapping("/{examId}/answer")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<ExamAnswerResponse>> saveAnswer(
            @PathVariable Long examId,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody AnswerRequest request) {

        ExamAnswerResponse data = examService.saveAnswer(examId, user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Answer saved", data));
    }

    // POST /api/exams/{examId}/submit
    // Submit the exam — grades all answers, calculates score, marks pass/fail
    @PostMapping("/{examId}/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<ExamResponse>> submitExam(
            @PathVariable Long examId,
            @AuthenticationPrincipal User user) {

        ExamResponse data = examService.submitExam(examId, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Exam submitted successfully", data));
    }

    // GET /api/exams/{examId}/review
    // Full post-exam review — reveals correct answers per question
    // Only available after exam is SUBMITTED or TIMED_OUT
    @GetMapping("/{examId}/review")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<ExamResponse>> getReview(
            @PathVariable Long examId,
            @AuthenticationPrincipal User user) {

        ExamResponse data = examService.getReview(examId, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Review retrieved", data));
    }

    // GET /api/exams/history
    // Get student's paginated exam history
    @GetMapping("/history")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<PaginatedResponse<ExamResponse>>> getHistory(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        PaginatedResponse<ExamResponse> data = examService.getHistoryPage(user.getId(), page, size);
        return ResponseEntity.ok(ApiResponse.success("Exam history retrieved", data));
    }

    // GET /api/exams/history/latest
    // Get the latest completed exam for review quickly
    @GetMapping("/history/latest")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<ExamResponse>> getLatestCompletedExam(
            @AuthenticationPrincipal User user) {

        ExamResponse data = examService.getLatestCompletedExam(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Latest completed exam retrieved", data));
    }

    // GET /api/exams/current
    // Get the current in-progress exam if any
    @GetMapping("/current")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<ExamResponse>> getCurrentExam(
            @AuthenticationPrincipal User user) {

        ExamResponse data = examService.getCurrentExam(user.getId());
        if (data == null) {
            return ResponseEntity.ok(ApiResponse.success("No current exam", null));
        }
        return ResponseEntity.ok(ApiResponse.success("Current exam retrieved", data));
    }

    // GET /api/exams/dashboard
    // Get student's dashboard stats and recent exam history
    @GetMapping("/dashboard")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard(
            @AuthenticationPrincipal User user) {

        DashboardResponse data = adminService.getStudentDashboard(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Dashboard retrieved", data));
    }
}