package com.hirestack.feedback;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "evaluation_scores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluationScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "feedback_id", nullable = false)
    private InterviewFeedback feedback;

    @Column(name = "criterion_name", nullable = false)
    private String criterionName;

    @Column(nullable = false)
    private Integer score;

    @Builder.Default
    private BigDecimal weight = BigDecimal.ONE;

    @Column(columnDefinition = "TEXT")
    private String comments;
}

