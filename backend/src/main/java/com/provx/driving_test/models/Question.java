package com.provx.driving_test.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "question_number", nullable = false)
    private Integer questionNumber;  // original number from PDF (1-433)

    @Column(name = "text_rw", nullable = false, columnDefinition = "TEXT")
    private String textRw;  // question text in Kinyarwanda

    @Column(name = "is_image_based", nullable = false)
    @Builder.Default
    private Boolean isImageBased = false;

    @Column(name = "image_filename", length = 255)
    private String imageFilename;  // e.g. sign_p043_i00.png — null if text-only

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationships
    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @OrderBy("optionLetter ASC")
    private List<QuestionOption> options;
}
