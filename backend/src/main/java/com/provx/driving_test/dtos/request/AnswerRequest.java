package com.provx.driving_test.dtos.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AnswerRequest {

    @NotNull(message = "Question ID is required")
    private Long questionId;

    // null = student skipped the question
    private Long selectedOptionId;
}