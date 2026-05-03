package com.provx.driving_test.dtos.response;

import com.provx.driving_test.enums.SessionStatus;
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
public class PracticeSessionResponse {

    private Long id;
    private SessionStatus status;
    private Integer totalQuestions;
    private Integer correctCount;
    private BigDecimal scorePercent;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;

    // The 20 questions for this session — included when session is first created
    // Options do NOT include isCorrect during practice (added per-answer via PracticeAnswerResponse)
    private List<QuestionResponse> questions;
}