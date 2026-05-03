package com.provx.driving_test.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamAnswerResponse {

    private Long questionId;
    private Integer position;          // 1-20, for the navigator grid
    private Long selectedOptionId;     // null if unanswered
    private Boolean isCorrect;         // null until exam submitted

    // Only populated in review response — not during active exam
    private Long correctOptionId;
    private String correctOptionText;
    private String questionTextRw;
    private String imageUrl;
    private java.util.List<OptionResponse> options;
}