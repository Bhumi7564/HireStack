package com.hirestack.feedback;

import com.hirestack.auth.User;
import com.hirestack.common.BaseEntity;
import com.hirestack.interview.Interview;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "interview_feedback", uniqueConstraints = {
        @UniqueConstraint(name = "uq_interview_feedback_submitter", columnNames = {"interview_id", "interviewer_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewFeedback extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id", nullable = false)
    private Interview interview;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interviewer_id", nullable = false)
    private User interviewer;

    @Column(name = "overall_rating", nullable = false)
    private Integer overallRating;

    @Column(name = "technical_skills_rating")
    private Integer technicalSkillsRating;

    @Column(name = "communication_rating")
    private Integer communicationRating;

    @Column(name = "problem_solving_rating")
    private Integer problemSolvingRating;

    @Column(name = "cultural_fit_rating")
    private Integer culturalFitRating;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InterviewRecommendation recommendation;

    @Column(columnDefinition = "TEXT")
    private String strengths;

    @Column(columnDefinition = "TEXT")
    private String weaknesses;

    @Column(name = "summary_comments", columnDefinition = "TEXT", nullable = false)
    private String summaryComments;

    @Column(name = "submitted_at", nullable = false)
    @Builder.Default
    private Instant submittedAt = Instant.now();

    @OneToMany(mappedBy = "feedback", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<EvaluationScore> evaluationScores = new ArrayList<>();
}

