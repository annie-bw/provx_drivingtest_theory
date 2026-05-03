package com.provx.driving_test.Repository;


import com.provx.driving_test.models.SessionQuestion;
import com.provx.driving_test.enums.SessionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SessionQuestionRepository extends JpaRepository<SessionQuestion, Long> {

    // Get all 20 questions for a session in display order (1-20)
    // Used to render the exam/practice question navigator and question list
    List<SessionQuestion> findBySessionTypeAndSessionIdOrderByPositionAsc(
            SessionType sessionType, Long sessionId);

    // Get a specific question at a position (used for "next question" navigation)
    Optional<SessionQuestion> findBySessionTypeAndSessionIdAndPosition(
            SessionType sessionType, Long sessionId, Integer position);

    // Count how many questions are in a session (sanity check — should always be 20)
    long countBySessionTypeAndSessionId(SessionType sessionType, Long sessionId);
}
