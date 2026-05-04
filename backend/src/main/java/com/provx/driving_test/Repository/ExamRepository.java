package com.provx.driving_test.Repository;

import com.provx.driving_test.models.Exam;
import com.provx.driving_test.enums.ExamStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Optional;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {

    // Check if student has an in-progress exam (prevent double exams)
    Optional<Exam> findByUserIdAndStatus(Long userId, ExamStatus status);

    // Get student's exam history, newest first
    List<Exam> findByUserIdOrderByStartedAtDesc(Long userId);

    // Get paginated student exam history, newest first
    Page<Exam> findByUserIdOrderByStartedAtDesc(Long userId, Pageable pageable);

    // Get latest completed exam for a student
    Optional<Exam> findFirstByUserIdAndStatusInOrderBySubmittedAtDesc(Long userId, List<ExamStatus> statuses);

    // Admin — count exams by status
    long countByStatus(ExamStatus status);

    // Admin — count all passed exams
    long countByPassedTrue();

    // Admin — get all exams ordered by start time desc
    List<Exam> findAllByOrderByStartedAtDesc();

    // OPTIMIZED: Get top 10 completed exams directly from DB
    @Query("SELECT e FROM Exam e WHERE e.status IN ('SUBMITTED', 'TIMED_OUT') ORDER BY e.startedAt DESC")
    List<Exam> findTop10CompletedByOrderByStartedAtDesc(Pageable pageable);

    // Admin — count exams for a user
    long countByUserId(Long userId);

    // Admin — count exams for a user by status
    long countByUserIdAndStatus(Long userId, ExamStatus status);

    // Admin — count passed exams for a user
    long countByUserIdAndPassedTrue(Long userId);

    // Admin — get best score for a user
    @Query("SELECT MAX(e.scorePercent) FROM Exam e WHERE e.user.id = :userId AND e.status = 'SUBMITTED'")
    Optional<java.math.BigDecimal> findBestScoreByUserId(@Param("userId") Long userId);

    // Admin — get last N exams for a user
    List<Exam> findTop5ByUserIdOrderByStartedAtDesc(Long userId);

    // Admin — get last N completed exams for a user
    List<Exam> findTop5ByUserIdAndStatusInOrderByStartedAtDesc(Long userId, List<ExamStatus> status);
}
