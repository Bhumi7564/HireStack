package com.hirestack.job;

import com.hirestack.common.BaseEntity;
import com.hirestack.company.Company;
import com.hirestack.recruiter.Recruiter;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "job_openings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobOpening extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recruiter_id")
    private Recruiter recruiter;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private String location;

    @Column(name = "employment_type", nullable = false)
    @Builder.Default
    private String employmentType = "FULL_TIME";

    @Column(name = "experience_level", nullable = false)
    @Builder.Default
    private String experienceLevel = "MID_LEVEL";

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    @Column(columnDefinition = "TEXT")
    private String responsibilities;

    @Column(name = "salary_range_min")
    private BigDecimal salaryRangeMin;

    @Column(name = "salary_range_max")
    private BigDecimal salaryRangeMax;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private JobStatus status = JobStatus.OPEN;

    @Column(name = "openings_count", nullable = false)
    @Builder.Default
    private Integer openingsCount = 1;

    @Column(name = "posted_date")
    @Builder.Default
    private LocalDate postedDate = LocalDate.now();

    @Column(name = "closing_date")
    private LocalDate closingDate;
}

