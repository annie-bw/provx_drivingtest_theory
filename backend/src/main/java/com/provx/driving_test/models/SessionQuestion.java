package com.provx.driving_test.models;

import com.provx.driving_test.enums.SessionType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "session_questions",
        uniqueConstraints = @UniqueConstraint(columnNames = {"session_type", "session_id", "position"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "session_type", nullable = false, length = 20)
    private SessionType sessionType;  // EXAM or PRACTICE

    // Points to exams.id or practice_sessions.id depending on sessionType
    @Column(name = "session_id", nullable = false)
    private Long sessionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name = "position", nullable = false)
    private Integer position;  // 1-20, display order
}
