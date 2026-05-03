package com.provx.driving_test.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OptionResponse {

    private String id;
    private String optionLetter; // "a", "b", "c", "d"
    private String textRw;

    // Only included in review/practice feedback responses — never during active
    // exam
    private Boolean isCorrect;
}
