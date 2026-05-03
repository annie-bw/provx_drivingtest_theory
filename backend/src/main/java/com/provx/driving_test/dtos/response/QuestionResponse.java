package com.provx.driving_test.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionResponse {

    private Long id;
    private Integer questionNumber;
    private String textRw;
    private Boolean isImageBased;

    // Full URL served by Spring Boot e.g. /images/signs/sign_p043_i00.png
    // null if text-only question
    private String imageUrl;

    private List<OptionResponse> options;

    // Position in the current session (1-20) — set by service, not stored in DB
    private Integer position;
}