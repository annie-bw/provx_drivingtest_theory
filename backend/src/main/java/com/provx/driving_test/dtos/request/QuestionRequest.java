package com.provx.driving_test.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class QuestionRequest {

    @NotNull(message = "Question number is required")
    private Integer questionNumber;

    @NotBlank(message = "Question text is required")
    private String textRw;

    private Boolean isImageBased = false;

    // Only provided when isImageBased = true
    private String imageFilename;

    @NotNull(message = "Options are required")
    @Size(min = 3, max = 4, message = "A question must have 3 or 4 options")
    private List<OptionRequest> options;

    @Data
    public static class OptionRequest {

        @NotBlank(message = "Option letter is required")
        private String optionLetter;  // "a", "b", "c", "d"

        @NotBlank(message = "Option text is required")
        private String textRw;

        @NotNull(message = "Correct flag is required")
        private Boolean isCorrect;
    }
}