package com.provx.driving_test.Repository;

import com.provx.driving_test.models.PracticeSession;
import com.provx.driving_test.enums.SessionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PracticeSessionRepository extends JpaRepository<PracticeSession, Long> {

    // Dashboard — get student's practice history, newest first
    List<PracticeSession> findByUserIdOrderByStartedAtDesc(Long userId);

    // Get paginated student practice history, newest first
    Page<PracticeSession> findByUserIdOrderByStartedAtDesc(Long userId, Pageable pageable);

    // Dashboard — get last N practice sessions for a student
    List<PracticeSession> findTop5ByUserIdOrderByStartedAtDesc(Long userId);

    // Check if student has an in-progress session (prevent double sessions)
    Optional<PracticeSession> findByUserIdAndStatus(Long userId, SessionStatus status);

    // Dashboard — count total practice sessions for a student
    long countByUserId(Long userId);

    // Dashboard — count completed sessions for a student
    long countByUserIdAndStatus(Long userId, SessionStatus status);

    // Admin — count all practice sessions in the system
    long countByStatus(SessionStatus status);

    // Admin — get best score for a student
    @Query("SELECT MAX(ps.scorePercent) FROM PracticeSession ps WHERE ps.user.id = :userId AND ps.status = 'COMPLETED'")
    Optional<java.math.BigDecimal> findBestScoreByUserId(@Param("userId") Long userId);
}