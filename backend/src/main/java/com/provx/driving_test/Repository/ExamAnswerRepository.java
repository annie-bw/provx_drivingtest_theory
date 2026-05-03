package com.provx.driving_test.Repository;

import com.provx.driving_test.models.ExamAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamAnswerRepository extends JpaRepository<ExamAnswer, Long> {

    // Get all answers for an exam (used for grading on submit + review page)
    List<ExamAnswer> findByExamId(Long examId);

    // Get a specific answer for an exam question (used when student selects an option)
    Optional<ExamAnswer> findByExamIdAndQuestionId(Long examId, Long questionId);

    // Count correct answers in an exam (used for score calculation)
    long countByExamIdAndIsCorrectTrue(Long examId);

    // Count unanswered questions in an exam
    long countByExamIdAndSelectedOptionIsNull(Long examId);
}