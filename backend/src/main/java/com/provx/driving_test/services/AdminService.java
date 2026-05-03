package com.provx.driving_test.services;

import com.provx.driving_test.dtos.response.DashboardResponse;
import com.provx.driving_test.dtos.response.ExamResponse;
import com.provx.driving_test.dtos.response.UserResponse;
import com.provx.driving_test.enums.ExamStatus;
import com.provx.driving_test.enums.Role;
import com.provx.driving_test.enums.SessionStatus;
import com.provx.driving_test.exceptions.ApiException;
import com.provx.driving_test.models.User;
import com.provx.driving_test.models.Exam;
import com.provx.driving_test.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

        private final UserRepository userRepository;
        private final ExamRepository examRepository;
        private final PracticeSessionRepository practiceSessionRepository;
        private final QuestionRepository questionRepository;
        private final ExamService examService;

        // -------------------------------------------------------
        // ADMIN DASHBOARD — system-wide stats
        // -------------------------------------------------------
        @Transactional
        public DashboardResponse getAdminDashboard() {
                long totalStudents = userRepository.countByRole(Role.STUDENT);
                long totalActive = userRepository.findByIsActiveTrue().stream()
                                .filter(u -> u.getRole() == Role.STUDENT).count();
                long totalQuestions = questionRepository.countByIsActiveTrue();
                long totalImageQ = questionRepository.countByIsImageBasedTrue();
                long totalExams = examRepository.countByStatus(ExamStatus.SUBMITTED);
                long totalPassed = examRepository.countByPassedTrue();

                BigDecimal overallPassRate = totalExams > 0
                                ? BigDecimal.valueOf(totalPassed)
                                                .divide(BigDecimal.valueOf(totalExams), 2, RoundingMode.HALF_UP)
                                                .multiply(BigDecimal.valueOf(100))
                                : BigDecimal.ZERO;

                // Last 10 exams across all students (only completed ones for review)
                List<ExamResponse> recentExams = examRepository.findAllByOrderByStartedAtDesc()
                                .stream()
                                .filter(e -> e.getStatus() == ExamStatus.SUBMITTED
                                                || e.getStatus() == ExamStatus.TIMED_OUT)
                                .limit(10)
                                .map(e -> examService.getReview(e.getId(), e.getUser().getId()))
                                .collect(Collectors.toList());

                // Last 10 registered users
                List<UserResponse> recentUsers = userRepository.findAll().stream()
                                .filter(u -> u.getRole() == Role.STUDENT)
                                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                                .limit(10)
                                .map(this::toUserResponse)
                                .collect(Collectors.toList());

                return DashboardResponse.builder()
                                .totalStudents(totalStudents)
                                .totalActiveStudents(totalActive)
                                .totalQuestions(totalQuestions)
                                .totalImageQuestions(totalImageQ)
                                .totalExamsInSystem(totalExams)
                                .totalPassedExamsInSystem(totalPassed)
                                .overallPassRate(overallPassRate)
                                .recentExams(recentExams)
                                .recentUsers(recentUsers)
                                .build();
        }

        // -------------------------------------------------------
        // STUDENT DASHBOARD — individual student stats
        // Called from the student's own dashboard page
        // -------------------------------------------------------
        @Transactional
        public DashboardResponse getStudentDashboard(Long userId) {
                long totalPractice = practiceSessionRepository.countByUserIdAndStatus(userId, SessionStatus.COMPLETED);
                long totalExams = examRepository.countByUserIdAndStatus(userId, ExamStatus.SUBMITTED)
                                + examRepository.countByUserIdAndStatus(userId, ExamStatus.TIMED_OUT);
                long totalPassed = examRepository.countByUserIdAndPassedTrue(userId);

                BigDecimal bestExam = examRepository.findBestScoreByUserId(userId).orElse(BigDecimal.ZERO);
                BigDecimal bestPractice = practiceSessionRepository.findBestScoreByUserId(userId)
                                .orElse(BigDecimal.ZERO);

                // Calculate average exam score
                BigDecimal averageExam = BigDecimal.ZERO;
                if (totalExams > 0) {
                        List<Exam> exams = examRepository.findByUserIdOrderByStartedAtDesc(userId)
                                        .stream()
                                        .filter(e -> e.getStatus() == ExamStatus.SUBMITTED)
                                        .collect(Collectors.toList());
                        if (!exams.isEmpty()) {
                                BigDecimal totalScore = exams.stream()
                                                .map(Exam::getScorePercent)
                                                .reduce(BigDecimal.ZERO, BigDecimal::add);
                                averageExam = totalScore.divide(BigDecimal.valueOf(exams.size()), 2,
                                                RoundingMode.HALF_UP);
                        }
                }

                List<ExamResponse> recentExams = examRepository
                                .findTop5ByUserIdAndStatusInOrderByStartedAtDesc(userId,
                                                List.of(ExamStatus.SUBMITTED, ExamStatus.TIMED_OUT))
                                .stream()
                                .map(e -> ExamResponse.builder()
                                                .id(e.getId().toString())
                                                .status(e.getStatus())
                                                .totalQuestions(e.getTotalQuestions())
                                                .correctCount(e.getCorrectCount())
                                                .scorePercent(e.getScorePercent())
                                                .passed(e.getPassed())
                                                .durationSeconds(calculateExamDuration(e))
                                                .startedAt(e.getStartedAt())
                                                .submittedAt(e.getSubmittedAt())
                                                .build())
                                .collect(Collectors.toList());

                return DashboardResponse.builder()
                                .totalPracticeSessions((int) totalPractice)
                                .totalExamsTaken((int) totalExams)
                                .totalExamsPassed((int) totalPassed)
                                .averageExamScore(averageExam)
                                .bestExamScore(bestExam)
                                .bestPracticeScore(bestPractice)
                                .recentExams(recentExams)
                                .build();
        }

        private int calculateExamDuration(Exam exam) {
                if (exam.getSubmittedAt() != null && exam.getStartedAt() != null) {
                        long seconds = java.time.Duration.between(exam.getStartedAt(), exam.getSubmittedAt())
                                        .getSeconds();
                        return (int) Math.max(0, seconds);
                }
                return exam.getDurationSeconds() != null ? exam.getDurationSeconds() : 0;
        }

        // -------------------------------------------------------
        // ADMIN — list all students
        // -------------------------------------------------------
        public List<UserResponse> getAllStudents() {
                return userRepository.findByRole(Role.STUDENT).stream()
                                .map(this::toUserResponse)
                                .collect(Collectors.toList());
        }

        // -------------------------------------------------------
        // ADMIN — toggle student active/inactive
        // -------------------------------------------------------
        @Transactional
        public UserResponse toggleUserActive(Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> ApiException.notFound("User", userId));

                if (user.getRole() == Role.ADMIN) {
                        throw ApiException.forbidden("Cannot deactivate an admin account");
                }

                user.setIsActive(!user.getIsActive());
                userRepository.save(user);
                return toUserResponse(user);
        }

        // -------------------------------------------------------
        // Private — map User entity to UserResponse
        // -------------------------------------------------------
        private UserResponse toUserResponse(User user) {
                return UserResponse.builder()
                                .id(user.getId())
                                .firstName(user.getFirstName())
                                .lastName(user.getLastName())
                                .email(user.getEmail())
                                .role(user.getRole())
                                .isActive(user.getIsActive())
                                .createdAt(user.getCreatedAt())
                                .build();
        }
}
