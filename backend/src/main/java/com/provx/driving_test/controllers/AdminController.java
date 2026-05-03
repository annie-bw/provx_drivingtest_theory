package com.provx.driving_test.controllers;

import com.provx.driving_test.dtos.request.QuestionRequest;
import com.provx.driving_test.dtos.response.*;
import com.provx.driving_test.models.User;
import com.provx.driving_test.services.AdminService;
import com.provx.driving_test.services.QuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")  // every endpoint in this controller requires ADMIN
public class AdminController {

    private final AdminService adminService;
    private final QuestionService questionService;

    // -------------------------------------------------------
    // DASHBOARD
    // -------------------------------------------------------

    // GET /api/admin/dashboard
    // System-wide stats — total students, pass rate, recent activity
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> getAdminDashboard() {
        return ResponseEntity.ok(
                ApiResponse.success("Dashboard retrieved", adminService.getAdminDashboard()));
    }

    // -------------------------------------------------------
    // USER MANAGEMENT
    // -------------------------------------------------------

    // GET /api/admin/users
    // List all registered students
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllStudents() {
        return ResponseEntity.ok(
                ApiResponse.success("Students retrieved", adminService.getAllStudents()));
    }

    // PATCH /api/admin/users/{userId}/toggle-active
    // Activate or deactivate a student account
    @PatchMapping("/users/{userId}/toggle-active")
    public ResponseEntity<ApiResponse<UserResponse>> toggleUserActive(
            @PathVariable Long userId) {

        UserResponse data = adminService.toggleUserActive(userId);
        return ResponseEntity.ok(ApiResponse.success("User status updated", data));
    }

    // -------------------------------------------------------
    // QUESTION MANAGEMENT
    // These mirror QuestionController but are grouped under /admin
    // for clarity — QuestionController is also admin-only
    // -------------------------------------------------------

    // GET /api/admin/questions
    @GetMapping("/questions")
    public ResponseEntity<ApiResponse<List<QuestionResponse>>> getAllQuestions() {
        return ResponseEntity.ok(
                ApiResponse.success("Questions retrieved", questionService.getAllQuestions()));
    }

    // GET /api/admin/questions/{id}
    @GetMapping("/questions/{id}")
    public ResponseEntity<ApiResponse<QuestionResponse>> getQuestion(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Question retrieved", questionService.getById(id)));
    }

    // POST /api/admin/questions
    @PostMapping("/questions")
    public ResponseEntity<ApiResponse<QuestionResponse>> createQuestion(
            @Valid @RequestBody QuestionRequest request) {

        QuestionResponse data = questionService.create(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Question created", data));
    }

    // PUT /api/admin/questions/{id}
    @PutMapping("/questions/{id}")
    public ResponseEntity<ApiResponse<QuestionResponse>> updateQuestion(
            @PathVariable Long id,
            @Valid @RequestBody QuestionRequest request) {

        QuestionResponse data = questionService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success("Question updated", data));
    }

    // DELETE /api/admin/questions/{id}
    @DeleteMapping("/questions/{id}")
    public ResponseEntity<ApiResponse<Void>> deactivateQuestion(@PathVariable Long id) {
        questionService.deactivate(id);
        return ResponseEntity.ok(ApiResponse.success("Question deactivated"));
    }

    // -------------------------------------------------------
    // STUDENT DASHBOARD — admin views a specific student's stats
    // -------------------------------------------------------

    // GET /api/admin/users/{userId}/dashboard
    @GetMapping("/users/{userId}/dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> getStudentDashboard(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                ApiResponse.success("Student dashboard retrieved",
                        adminService.getStudentDashboard(userId)));
    }
}