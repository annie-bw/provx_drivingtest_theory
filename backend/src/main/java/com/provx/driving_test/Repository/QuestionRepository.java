package com.provx.driving_test.Repository;

import com.provx.driving_test.models.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    // Core — draw 20 random active questions for a session
    // Optimized: Use TABLESAMPLE for better performance on large datasets
    @Query(value = "SELECT * FROM questions WHERE is_active = true ORDER BY RANDOM() LIMIT 20",
            nativeQuery = true)
    List<Question> findRandom20Active();

    // Alternative optimized version using TABLESAMPLE (if supported by CockroachDB)
    // @Query(value = "SELECT * FROM questions WHERE is_active = true TABLESAMPLE BERNOULLI(10) LIMIT 20",
    //         nativeQuery = true)
    // List<Question> findRandom20Active();

    // Core — draw 20 random from text-only questions
    @Query(value = "SELECT * FROM questions WHERE is_active = true AND is_image_based = false ORDER BY RANDOM() LIMIT 20",
            nativeQuery = true)
    List<Question> findRandom20TextOnly();

    // Admin — get all active questions
    List<Question> findByIsActiveTrue();

    // Admin — get active questions with pagination
    Page<Question> findByIsActiveTrue(Pageable pageable);

    // Admin — get all image-based questions
    List<Question> findByIsImageBasedTrue();

    // Admin — get all text-only questions
    List<Question> findByIsImageBasedFalse();

    // Admin — count total active questions
    long countByIsActiveTrue();

    // Admin — count image questions
    long countByIsImageBasedTrue();

    // Admin — search questions by text
    @Query("SELECT q FROM Question q WHERE LOWER(q.textRw) LIKE LOWER(CONCAT('%', :keyword, '%')) AND q.isActive = true")
    List<Question> searchByKeyword(@Param("keyword") String keyword);

    // Check if question number already exists (for import)
    boolean existsByQuestionNumber(Integer questionNumber);
}