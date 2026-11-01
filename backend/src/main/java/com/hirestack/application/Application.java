package com.hirestack.application;

import com.hirestack.candidate.Candidate;
import com.hirestack.common.BaseEntity;
import com.hirestack.job.JobOpening;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "applications", uniqueConstraints = {
        @UniqueConstraint(name = "uq_job_candidate", columnNames = {"job_id", "candidate_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private JobOpening job;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_stage", nullable = false)
    @Builder.Default
    private ApplicationStatus currentStage = ApplicationStatus.APPLIED;

    @Column(name = "applied_date", nullable = false)
    @Builder.Default
    private Instant appliedDate = Instant.now();

    @Column(name = "cover_letter", columnDefinition = "TEXT")
    private String coverLetter;

    private Integer rating;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "hired_date")
    private Instant hiredDate;
}

