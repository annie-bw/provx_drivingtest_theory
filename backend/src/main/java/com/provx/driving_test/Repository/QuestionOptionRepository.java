package com.provx.driving_test.Repository;

import com.provx.driving_test.models.QuestionOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuestionOptionRepository extends JpaRepository<QuestionOption, Long> {

    // Get all options for a question (used when building answer objects)
    List<QuestionOption> findByQuestionIdOrderByOptionLetterAsc(Long questionId);

    // Get the correct option for a question (used when creating ExamAnswer.correctOption)
    Optional<QuestionOption> findByQuestionIdAndIsCorrectTrue(Long questionId);

    // Delete all options for a question (used when admin edits a question)
    void deleteByQuestionId(Long questionId);
}
