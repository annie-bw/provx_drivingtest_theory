package com.provx.driving_test.dtos.response;

import com.provx.driving_test.enums.ExamStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamResponse {

    private String id;
    private ExamStatus status;
    private Integer totalQuestions;
    private Integer correctCount;        // null until submitted
    private BigDecimal scorePercent;     // null until submitted
    private Boolean passed;              // null until submitted
    private BigDecimal passThreshold;
    private Integer durationSeconds;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private LocalDateTime expiresAt;     // frontend uses this to drive the countdown timer

    // The 20 questions — included when exam is first created
    // isCorrect on options is NEVER sent during active exam
    private List<QuestionResponse> questions;

    // Current answer state per question — used to restore navigator grid state
    // if student refreshes page mid-exam
    private List<ExamAnswerResponse> answers;

    // Full review data — only populated after submission
    private List<ExamAnswerResponse> review;
}