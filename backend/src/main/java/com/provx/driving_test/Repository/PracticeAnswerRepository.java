package com.provx.driving_test.Repository;

import com.provx.driving_test.models.ExamAnswer;
import com.provx.driving_test.models.PracticeAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PracticeAnswerRepository extends JpaRepository<PracticeAnswer, Long> {

    // Get all answers for a session (used to calculate score on completion)
    List<PracticeAnswer> findBySessionId(Long sessionId);

    // Check if a specific question was already answered in this session
    Optional<PracticeAnswer> findBySessionIdAndQuestionId(Long sessionId, Long questionId);

    // Count correct answers in a session
    long countBySessionIdAndIsCorrectTrue(Long sessionId);

    // Admin — average score across all practice sessions
    @Query("SELECT AVG(CASE WHEN pa.isCorrect = true THEN 1.0 ELSE 0.0 END) FROM PracticeAnswer pa WHERE pa.session.user.id = :userId")
    Optional<Double> findAverageCorrectRateByUserId(@Param("userId") Long userId);
}