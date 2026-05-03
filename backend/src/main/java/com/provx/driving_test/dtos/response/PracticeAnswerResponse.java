package com.provx.driving_test.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PracticeAnswerResponse {

    private Long questionId;
    private Long selectedOptionId;

    // Instant feedback — these are returned immediately after student answers
    private Boolean isCorrect;
    private Long correctOptionId;
    private String correctOptionText;  // shown in red feedback bar on frontend
}