package com.provx.driving_test.models;


import com.provx.driving_test.enums.ExamStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "exams")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Exam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ExamStatus status = ExamStatus.IN_PROGRESS;

    @Column(name = "total_questions", nullable = false)
    private Integer totalQuestions = 20;

    // set on submission
    @Column(name = "correct_count")
    private Integer correctCount;

    // set on submission
    @Column(name = "score_percent", precision = 5, scale = 2)
    private BigDecimal scorePercent;

    // set on submission — true if scorePercent >= passThreshold
    @Column(name = "passed")
    private Boolean passed;

    @Column(name = "pass_threshold", nullable = false, precision = 5, scale = 2)
    private BigDecimal passThreshold = new BigDecimal("60.00");  // 12/20 = 60%

    @Column(name = "duration_seconds", nullable = false)
    private Integer durationSeconds = 1200;  // 20 minutes

    @CreationTimestamp
    @Column(name = "started_at", updatable = false)
    private LocalDateTime startedAt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    // startedAt + 20 min — set when exam is created
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    // Relationships
    @OneToMany(mappedBy = "exam", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ExamAnswer> answers;
}
