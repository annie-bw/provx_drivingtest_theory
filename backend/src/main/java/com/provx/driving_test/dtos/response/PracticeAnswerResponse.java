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

    private String questionId;
    private String selectedOptionId;

    // Instant feedback — these are returned immediately after student answers
    private Boolean isCorrect;
    private String correctOptionId;
    private String correctOptionText; // shown in red feedback bar on frontend
}
