package com.provx.driving_test.models;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "exam_answers",
        uniqueConstraints = @UniqueConstraint(columnNames = {"exam_id", "question_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    // null = student left this question unanswered
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "selected_option_id")
    private QuestionOption selectedOption;

    // always stored at exam creation time — used for review page
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "correct_option_id", nullable = false)
    private QuestionOption correctOption;

    // null until exam is submitted/timed out
    @Column(name = "is_correct")
    private Boolean isCorrect;
}