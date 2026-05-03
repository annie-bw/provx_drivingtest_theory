package com.provx.driving_test.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {

    // -------------------------------------------------------
    // Student dashboard stats
    // -------------------------------------------------------
    private Integer totalPracticeSessions;
    private Integer totalExamsTaken;
    private Integer totalExamsPassed;
    private BigDecimal bestExamScore;
    private BigDecimal averageExamScore;  // average of all exam scores
    private BigDecimal bestPracticeScore;

    // Recent exam history shown in the dashboard table
    private List<ExamResponse> recentExams;

    // -------------------------------------------------------
    // Admin dashboard stats (only populated for ADMIN role)
    // -------------------------------------------------------
    private Long totalStudents;
    private Long totalActiveStudents;
    private Long totalQuestions;
    private Long totalImageQuestions;
    private Long totalExamsInSystem;
    private Long totalPassedExamsInSystem;
    private BigDecimal overallPassRate;    // across all students
    private List<UserResponse> recentUsers;
}