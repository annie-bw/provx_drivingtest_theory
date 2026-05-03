package com.provx.driving_test.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "question_options",
        uniqueConstraints = @UniqueConstraint(columnNames = {"question_id", "option_letter"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name = "option_letter", nullable = false, length = 1, columnDefinition = "CHAR(1)")
    private String optionLetter;  // "a", "b", "c", "d"

    @Column(name = "text_rw", nullable = false, columnDefinition = "TEXT")
    private String textRw;

    @Column(name = "is_correct", nullable = false)
    private Boolean isCorrect = false;
}
